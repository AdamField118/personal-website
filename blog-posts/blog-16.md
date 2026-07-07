---
title: "FEMMI: Mass Map Inversion by Finite Elements and Boundary Integrals"
date: "2026-07-06"
tags: "Gravitational Lensing, Numerical Methods, Research"
snippet: "A deep dive into FEMMI, my finite-element approach to weak-lensing mass reconstruction: why the boundary condition is the whole problem, why shear demands cubic P3 elements, how FEM-BEM coupling fixes the far field exactly, and how Morozov's principle removes the last free parameter."
---

# FEMMI: Mass Map Inversion by Finite Elements and Boundary Integrals

In my [companion post on the weak-lensing pipeline](https://adamfield.org/pages/posts/weak-lensing-investigating-dark-matter-in-galaxy-clusters.html), the final step was **mass inversion**: turning a catalog of measured galaxy shears $(\gamma_1, \gamma_2)$ back into the projected mass map $\kappa(\boldsymbol{\theta})$ that produced them. The standard tool there was the Kaiser-Squires (1993) Fourier inversion. This post is about **FEMMI** (Finite Element Mass Map Inversion), my independent research project that does the same job with a completely different numerical foundation, and why that foundation matters.

The short version: Kaiser-Squires and every FFT-based method quietly assume the wrong boundary condition. FEMMI fixes the boundary exactly, uses cubic finite elements because shear is a second derivative, and selects its own regularization strength from the noise. Everything below is implemented in the [FEMMI codebase](https://github.com/AdamField118/FEMMI); the interactive demos are simplified illustrations of the real ideas.

## 1. The Forward Problem

A lens with convergence $\kappa(\boldsymbol{\theta})$ produces a **lensing potential** $\psi$ satisfying the 2D Poisson equation, not on a box, but on all of the plane, with a decay condition at infinity:

$$\nabla^2 \psi = 2\kappa \quad \text{in } \mathbb{R}^2, \qquad \psi(\boldsymbol{\theta}) \to 0 \text{ as } |\boldsymbol{\theta}| \to \infty. \qquad\boldsymbol{(1)}$$

The shear we actually observe is the **traceless Hessian** of that potential:

$$\gamma_1 = \frac{1}{2}\left(\frac{\partial^2 \psi}{\partial x^2} - \frac{\partial^2 \psi}{\partial y^2}\right), \qquad \gamma_2 = \frac{\partial^2 \psi}{\partial x\, \partial y}. \qquad\boldsymbol{(2)}$$

Equation (2) is the hinge of this entire post. **Shear is a second derivative of the thing we solve for.** That single fact dictates almost every design decision in FEMMI, from the element order to the boundary treatment. The exact solution of (1), using the 2D Laplacian Green's function $G(\mathbf{x}, \mathbf{y}) = \frac{1}{2\pi}\ln|\mathbf{x}-\mathbf{y}|$, is the volume potential

$$\psi(\mathbf{x}) = \frac{1}{\pi} \int_{\mathbb{R}^2} \ln|\mathbf{x}-\mathbf{y}|\, \kappa(\mathbf{y})\, d^2y. \qquad\boldsymbol{(3)}$$

The logarithm is the source of all our trouble: it decays *extremely* slowly. There is no finite radius beyond which $\psi$ is negligibly small.

## 2. Why the Boundary Is the Whole Problem

Any practical solver has to work on a finite domain $\Omega = [-L, L]^2$. The tempting move, and the one implicitly baked into FFT methods, is to impose $\psi = 0$ on the box boundary $\partial\Omega$. This is wrong, and not in a subtle numerical sense: it encodes a different continuous operator than the physical one.

Because the true $\psi$ from equation (3) decays only logarithmically, it is **nonzero at any finite boundary**. Clamping it to zero introduces a systematic error $e = \psi_{\mathrm{true}} - \psi_{\mathrm{FEM}}$ that satisfies

$$\nabla^2 e = 0 \quad \text{in } \Omega, \qquad e\big|_{\partial\Omega} = \psi_{\mathrm{true}}\big|_{\partial\Omega} \neq 0. \qquad\boldsymbol{(4)}$$

This $e$ is a harmonic function with nonzero boundary data. By the **maximum principle**, a harmonic function attains its extrema on the boundary, but it is nonzero throughout the interior. The boundary error does not stay near the boundary; it bleeds inward across the entire domain. Since shear is the Hessian of $\psi$ (equation 2), and $e$ has a nonzero Hessian wherever the boundary data varies with angle, this contamination shows up directly in the reconstructed mass. The MAP optimizer, trying to fit shear it cannot otherwise explain, compensates by **inventing spurious mass near the boundary**.

The demo below lets you see this directly. The lens sits off-center (so the boundary data genuinely varies), and the heatmap shows the harmonic error field the Dirichlet truncation injects. Toggle to the FEM-BEM mode to see what the exact far-field treatment does to it.

[codeContainer](../scripts/blog-post-scripts/femmi-boundary-demo.js)

*Demo 1: The boundary truncation error. Clamping $\psi = 0$ on a finite box injects a harmonic error (blue/red) that spreads through the interior by the maximum principle. Enlarging the box shrinks the contamination but never eliminates it, because the logarithmic tail is always nonzero. FEMMI's FEM-BEM coupling sets this error to zero exactly, independent of box size.*

The deeper way to say this: the naive Dirichlet formulation violates the **transmission condition** at the boundary. Physically, the normal derivative of $\psi$ must be continuous across $\partial\Omega$,

$$\left[\frac{\partial \psi}{\partial n}\right]_{\partial\Omega} = 0, \qquad\boldsymbol{(5)}$$

but replacing the boundary rows of the stiffness matrix with identity rows (which is what "impose $\psi = 0$" means in a finite element code) does not respect the exterior harmonic extension. FEMMI enforces (5) exactly.

## 3. The Fix: FEM-BEM Coupling

FEMMI's central construction is a hybrid. Inside the domain, a finite element method solves $\nabla^2 \psi = 2\kappa$ where the mass actually lives. Outside, a **boundary element method (BEM)** represents the exterior solution, which is harmonic ($\kappa = 0$ there) and decays at infinity, using only quantities defined on the boundary curve. The two are stitched together along $\partial\Omega$.

The interior weak form is assembled with the **Neumann stiffness matrix** $K$, meaning no boundary rows are modified. The exterior contributes a Calderon operator built from the four classical boundary integral operators: the single-layer matrix $V_h$, the double-layer matrix $K_h$, and the boundary mass matrix $M_b$. The coupled system is the Johnson-Nedelec monolithic coupling,

$$A_{\mathrm{coupled}} = K + P^\top C P, \qquad C = V_h^{-1}\left(\tfrac{1}{2} M_b + K_h\right), \qquad\boldsymbol{(6)}$$

where $P$ restricts the interior degrees of freedom to the boundary. The Calderon preconditioner $C$ is assembled once and stored; each forward solve then costs two sparse triangular solves (one forward, one adjoint). The payoff is that the far-field condition $\psi \to 0$ at infinity is imposed *without approximation*, and, as a bonus, the notorious **mass-sheet degeneracy** (the $\kappa \to \kappa + \text{const}$ ambiguity that plagues FFT methods) is resolved: the forward operator $F$ becomes injective, so the inverse problem has a genuinely unique solution once a single-node gauge pins down the additive constant in $\psi$.

## 4. Why Cubic P3 Elements

Return to equation (2): shear is a second derivative of $\psi$. This has an unforgiving consequence for the choice of finite element.

- **P1 (linear) elements** are piecewise linear. Their second derivative is *identically zero*. A P1 discretization of $\psi$ produces no shear at all.
- **P2 (quadratic) elements** have piecewise-*constant* second derivatives: a staircase that does not converge to a smooth curve under mesh refinement.
- **P3 (cubic) elements** have piecewise-*linear* second derivatives, which converge to the true shear at rate $O(h^2)$.

FEMMI therefore uses the 10-node cubic P3 Lagrange element, which also delivers $O(h^4)$ accuracy in $L^2$ for the potential itself. The demo below makes the argument concrete: approximate a smooth potential slice with each element order and watch what happens to the recovered second derivative.

[codeContainer](../scripts/blog-post-scripts/femmi-p3-shear-demo.js)

*Demo 2: Why P3. The left panel fits a smooth potential slice with piecewise polynomials; the right panel shows the recovered second derivative (the shear). P1 gives zero, P2 gives a non-converging staircase, and only P3 produces a piecewise-linear approximation that tightens toward the true curve as you refine the mesh. This is not a tuning choice; it is forced by the physics of equation (2).*

## 5. The Inverse Problem

With a trustworthy forward operator $F: \kappa \mapsto (\gamma_1, \gamma_2)$ in hand, reconstruction is the **maximum a posteriori (MAP)** estimate. We minimize a Tikhonov-regularized least-squares functional,

$$\mathcal{L}(\kappa) = \|F\kappa - \gamma_{\mathrm{obs}}\|^2 + \lambda\, \kappa^\top R\, \kappa, \qquad R = M + \ell^2 K, \qquad\boldsymbol{(7)}$$

where the regularization operator $R$ is a Matern-$\tfrac{1}{2}$ prior with correlation length $\ell$: it penalizes roughness while allowing physically motivated correlation structure to fill in gaps (this is what lets FEMMI inpaint across masked regions, such as the footprint of a bright cluster galaxy). The functional is minimized with L-BFGS, and the gradient comes from the **adjoint** of the coupled system,

$$\frac{\partial \mathcal{L}}{\partial \kappa} = -4M\, A_{\mathrm{coupled}}^{-\top}\left(S_1^\top r_1 + S_2^\top r_2\right) + 2\lambda R\kappa, \qquad\boldsymbol{(8)}$$

where $S_1, S_2$ are the shear operators (the discrete traceless Hessian) and $r_i = \gamma_i - \gamma_{i,\mathrm{obs}}$ is the residual. The adjoint solve reuses the same stored factorization as the forward solve, so each L-BFGS iteration is cheap.

This places lensing inversion squarely in the framework of **inverse scattering theory**. The forward operator $F$ is compact (its singular values decay to zero), exactly as in the Born approximation for acoustic scattering. Compactness is precisely why the problem is ill-posed: small, high-frequency perturbations in the data (noise) map back to large perturbations in $\kappa$ unless we regularize. FEMMI leans into this analogy, even implementing the Kirsch factorization method and the linear sampling method for parameter-free recovery of the *support* of the mass from the truncated SVD of $F$.

## 6. Removing the Last Free Parameter: Morozov's Principle

Equation (7) has a free knob, the regularization strength $\lambda$. Too small and the reconstruction fits the noise; too large and it washes the mass out into a featureless blur. Kaiser-Squires hides this same knob inside the width of a smoothing kernel, chosen by hand. FEMMI chooses it automatically.

The tool is **Morozov's discrepancy principle** (Morozov 1966). The idea is simple and rigorous: do not fit the data more precisely than the noise allows. Pick the $\lambda$ at which the residual equals the known noise level,

$$D(\lambda) = \big\|F\kappa_\lambda - \gamma_{\mathrm{obs}}\big\|_{\mathrm{RMS}} - c\,\delta = 0, \qquad\boldsymbol{(9)}$$

where $\delta$ is the noise level (estimated from the data via a median-absolute-deviation statistic) and $c$ is an order-unity safety factor. Because $D(\lambda)$ is monotonic, a Brent root-find locates the crossing in roughly 15 to 25 forward solves. No hand-tuning, no eyeballing.

The demo below is a one-dimensional stand-in for the full problem. The forward operator is a Gaussian blur (compact, just like $F$), and Tikhonov regularization acts as a spectral filter. Slide $\lambda$ to feel the under- and over-smoothing regimes, then press "Auto λ" to let Morozov's principle pick the crossing for you.

[codeContainer](../scripts/blog-post-scripts/femmi-morozov-demo.js)

*Demo 3: Morozov's discrepancy principle. Left, the reconstruction (blue) against the true mass (grey) and noisy data (light red). Right, the discrepancy $D(\lambda)$ rising monotonically; where it crosses the noise floor (dashed) is the automatically selected $\lambda$. Push $\lambda$ too low and you fit noise; too high and the two peaks merge. Increase the noise level and watch the optimal $\lambda$ move.*

## 7. Where FEMMI Stands

On synthetic benchmarks (a Gaussian convergence field on a $20\times20$ P3 mesh), FEMMI validates the theory: the Poisson solve converges at the predicted $O(h^4)$ in $L^2$, the forward shear operator at $O(h^2)$, and the automatic Morozov selection produces reconstructions competitive with, and on masked fields visibly better than, the FFT-based Kaiser-Squires baseline, which collapses near mask boundaries where FEMMI's Matern prior propagates structure smoothly across the gap.

The honest tradeoff is cost. FEMMI is far more expensive than a single FFT: it assembles boundary integral operators, factors a coupled system, and runs an iterative optimizer with automatic parameter selection on top. For a single cluster this is a non-issue; for a full survey with thousands of fields it is a real engineering question, and one of the reasons the neural-network components of my broader pipeline (ShearNet for shape measurement, DeconvNet for PSF removal) are attractive. FEMMI is the inversion stage of that end-to-end pipeline, and my current work is on scaling it and coupling it directly to catalog-native galaxy positions rather than binned shear grids.

## 8. Conclusions

FEMMI is, at heart, an argument that the boundary condition is not a numerical detail but the core physics of mass inversion. The logarithmic far field of the lensing potential means that any method truncating to a box with $\psi = 0$ solves the wrong problem, and pays for it with boundary-hugging artifacts. Solving the right problem requires three ingredients working together: an exact exterior representation via FEM-BEM coupling, cubic P3 elements because shear is a second derivative, and automatic regularization via Morozov's principle so there is nothing left to hand-tune. The reward is a mass estimate with a unique solution (no mass-sheet degeneracy), graceful behavior across masks, and a clean connection to the mature mathematics of inverse scattering.

If you want the full derivations, they are in the [`MATH.md`](https://github.com/AdamField118/FEMMI/blob/main/MATH.md) of the repository, and I am always happy to talk about any of it.

---

## References

1. **Kaiser, N. & Squires, G. (1993).** "Mapping the dark matter with weak gravitational lensing." *ApJ*, 404, 441.

2. **Morozov, V. A. (1966).** "On the solution of functional equations by the method of regularization." *Soviet Math. Doklady*, 7, 414.

3. **Colton, D. & Kress, R. (2013).** *Inverse Acoustic and Electromagnetic Scattering Theory*, 3rd ed. Springer.

4. **Steinbach, O. (2008).** *Numerical Approximation Methods for Elliptic Boundary Value Problems.* Springer.

5. **Kirsch, A. (1998).** "Characterization of the shape of a scattering obstacle using the spectral data of the far-field operator." *Inverse Problems*, 14, 1489.

6. **Brenner, S. & Scott, R. (2008).** *The Mathematical Theory of Finite Element Methods*, 3rd ed. Springer.

7. **FEMMI GitHub:** [github.com/AdamField118/FEMMI](https://github.com/AdamField118/FEMMI)

---

*Questions or corrections? Email me at adfield@wpi.edu*

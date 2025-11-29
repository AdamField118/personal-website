---
title: "Solving the 2D Wave Equation: Separation of Variables and Mode Analysis"
date: "2025-11-28"
tags: Mathematics, Wave Mechanics
snippet: "Analytical solution to the two-dimensional wave equation via separation of variables, with normal mode analysis and interactive visualization."
---

# Solving the 2D Wave Equation: Separation of Variables and Mode Analysis

## Abstract

We derive the analytical solution to the two-dimensional wave equation on a rectangular domain using the method of separation of variables. The solution emerges as an infinite double sum of normal modes, each corresponding to a characteristic frequency determined by the domain geometry. We provide a complete mathematical derivation, physical interpretation of standing wave patterns, and an interactive demonstration that visualizes the rich dynamics of 2D wave propagation.

## 1. Problem Statement

Consider a rectangular membrane with sides of length $a$ and $b$, fixed at all edges. Let $u(x, y, t)$ represent the vertical displacement of the membrane at position $(x, y)$ and time $t$. The membrane's motion is governed by the **two-dimensional wave equation**:

$$u_{tt} = c^2(u_{xx} + u_{yy}), \qquad\boldsymbol{(1)}$$

where $c \in \mathbb{R}^+$ is the wave speed, determined by the tension and mass density of the membrane.

**Boundary Conditions** (fixed edges):

$$u(0, y, t) = u(a, y, t) = 0, \quad u(x, 0, t) = u(x, b, t) = 0, \qquad\boldsymbol{(2)}$$

**Initial Conditions**:

$$u(x, y, 0) = f(x, y), \quad u_t(x, y, 0) = g(x, y), \qquad\boldsymbol{(3)}$$

where $f(x, y)$ is the initial displacement and $g(x, y)$ is the initial velocity.

**Goal**: Find $u(x, y, t)$ that satisfies (1), (2), and (3).

## 2. Method of Separation of Variables

### 2.1 Ansatz: Product Solutions

Following the method of separation of variables, we seek solutions of the special form:

$$u(x, y, t) = X(x) Y(y) T(t), \qquad\boldsymbol{(4)}$$

where $X(x)$ depends only on $x$, $Y(y)$ depends only on $y$, and $T(t)$ depends only on $t$.

**Key Insight**: While not all solutions have this form, the wave equation is linear, so any superposition of such solutions is also a solution. We will find a complete set of separable solutions and combine them to satisfy arbitrary initial conditions.

### 2.2 Substitution and Separation

Substituting (4) into (1):

$$X(x) Y(y) T''(t) = c^2 [X''(x) Y(y) T(t) + X(x) Y''(y) T(t)].$$

Dividing both sides by $c^2 X(x) Y(y) T(t)$:

$$\frac{T''(t)}{c^2 T(t)} = \frac{X''(x)}{X(x)} + \frac{Y''(y)}{Y(y)}. \qquad\boldsymbol{(5)}$$

**Separation Principle**: The left side depends only on $t$, while the right side depends only on $x$ and $y$. For this equality to hold for all $x$, $y$, and $t$, both sides must equal the same constant. We denote this constant by $-\lambda$ (the negative sign anticipates oscillatory solutions):

$$\frac{T''(t)}{c^2 T(t)} = -\lambda, \quad \frac{X''(x)}{X(x)} + \frac{Y''(y)}{Y(y)} = -\lambda. \qquad\boldsymbol{(6)}$$

### 2.3 Further Separation in Space

The spatial equation can be separated further. Rearranging:

$$\frac{X''(x)}{X(x)} = -\lambda - \frac{Y''(y)}{Y(y)}. \qquad\boldsymbol{(7)}$$

Again by the separation principle, both sides must equal a constant, which we call $-\mu$:

$$\frac{X''(x)}{X(x)} = -\mu, \quad \frac{Y''(y)}{Y(y)} = -\nu, \qquad\boldsymbol{(8)}$$

where $\nu = \lambda - \mu$ (the separation constants must sum to $\lambda$).

## 3. Solving the Spatial Equations

### 3.1 The $X$ Equation with Boundary Conditions

From equation (8), we have the eigenvalue problem:

$$X''(x) + \mu X(x) = 0, \quad X(0) = X(a) = 0. \qquad\boldsymbol{(9)}$$

This is the classic Sturm-Liouville problem. The general solution is:

$$X(x) = A \cos(\sqrt{\mu} x) + B \sin(\sqrt{\mu} x).$$

Applying $X(0) = 0$: This gives $A = 0$.

Applying $X(a) = 0$: This gives $B \sin(\sqrt{\mu} a) = 0$.

For nontrivial solutions ($B \neq 0$), we require:

$$\sin(\sqrt{\mu} a) = 0 \implies \sqrt{\mu} a = m\pi, \quad m \in \mathbb{N}.$$

Therefore, the eigenvalues and eigenfunctions are:

$$\mu_m = \left(\frac{m\pi}{a}\right)^2, \quad X_m(x) = \sin\left(\frac{m\pi x}{a}\right), \quad m = 1, 2, 3, \ldots \qquad\boldsymbol{(10)}$$

### 3.2 The $Y$ Equation with Boundary Conditions

Similarly, for the $Y$ equation:

$$Y''(y) + \nu Y(y) = 0, \quad Y(0) = Y(b) = 0. \qquad\boldsymbol{(11)}$$

By the same analysis:

$$\nu_n = \left(\frac{n\pi}{b}\right)^2, \quad Y_n(y) = \sin\left(\frac{n\pi y}{b}\right), \quad n = 1, 2, 3, \ldots \qquad\boldsymbol{(12)}$$

### 3.3 The Eigenvalue Relationship

Since $\lambda = \mu + \nu$, for each pair $(m, n)$:

$$\lambda_{mn} = \mu_m + \nu_n = \pi^2 \left(\frac{m^2}{a^2} + \frac{n^2}{b^2}\right). \qquad\boldsymbol{(13)}$$

## 4. Solving the Temporal Equation

### 4.1 The Time Evolution

From equation (6):

$$T''(t) + c^2 \lambda_{mn} T(t) = 0. \qquad\boldsymbol{(14)}$$

Define the **characteristic frequency**:

$$\omega_{mn} = c\sqrt{\lambda_{mn}} = c\pi \sqrt{\frac{m^2}{a^2} + \frac{n^2}{b^2}}. \qquad\boldsymbol{(15)}$$

The general solution for $T(t)$ is:

$$T_{mn}(t) = A_{mn} \cos(\omega_{mn} t) + B_{mn} \sin(\omega_{mn} t). \qquad\boldsymbol{(16)}$$

This represents harmonic oscillation at frequency $\omega_{mn}$.

### 4.2 Normal Modes

Combining spatial and temporal parts, each pair $(m, n)$ gives a **normal mode**:

$$u_{mn}(x, y, t) = \sin\left(\frac{m\pi x}{a}\right) \sin\left(\frac{n\pi y}{b}\right) [A_{mn} \cos(\omega_{mn} t) + B_{mn} \sin(\omega_{mn} t)]. \qquad\boldsymbol{(17)}$$

**Physical Interpretation**: Each mode $(m, n)$ is a standing wave pattern with:
- $m$ half-wavelengths in the $x$-direction
- $n$ half-wavelengths in the $y$-direction
- Oscillation frequency $\omega_{mn}$

## 5. General Solution via Superposition

### 5.1 Infinite Double Sum

By the **superposition principle** (linearity of the wave equation), the general solution is:

$$\boxed{u(x, y, t) = \sum_{m=1}^{\infty} \sum_{n=1}^{\infty} \sin\left(\frac{m\pi x}{a}\right) \sin\left(\frac{n\pi y}{b}\right) [A_{mn} \cos(\omega_{mn} t) + B_{mn} \sin(\omega_{mn} t)]} \qquad\boldsymbol{(18)}$$

This is a **double Fourier series** expansion in space, with time-dependent coefficients.

### 5.2 Determining Coefficients from Initial Conditions

We must choose $A_{mn}$ and $B_{mn}$ to satisfy the initial conditions (3).

**Initial Displacement** ($t = 0$):

$$u(x, y, 0) = \sum_{m=1}^{\infty} \sum_{n=1}^{\infty} A_{mn} \sin\left(\frac{m\pi x}{a}\right) \sin\left(\frac{n\pi y}{b}\right) = f(x, y). \qquad\boldsymbol{(19)}$$

**Initial Velocity** ($t = 0$):

$$u_t(x, y, 0) = \sum_{m=1}^{\infty} \sum_{n=1}^{\infty} B_{mn} \omega_{mn} \sin\left(\frac{m\pi x}{a}\right) \sin\left(\frac{n\pi y}{b}\right) = g(x, y). \qquad\boldsymbol{(20)}$$

### 5.3 Orthogonality and Fourier Coefficients

The sine functions form an orthogonal set. Using the orthogonality relation:

$$\int_0^a \sin\left(\frac{m\pi x}{a}\right) \sin\left(\frac{m'\pi x}{a}\right) dx = \begin{cases} 0 & m \neq m' \\ \frac{a}{2} & m = m' \end{cases}$$

and similarly for $y$, we can extract the coefficients by multiplying (19) and (20) by $\sin\left(\frac{m\pi x}{a}\right) \sin\left(\frac{n\pi y}{b}\right)$ and integrating over the domain:

$$A_{mn} = \frac{4}{ab} \int_0^a \int_0^b f(x, y) \sin\left(\frac{m\pi x}{a}\right) \sin\left(\frac{n\pi y}{b}\right) dx\, dy, \qquad\boldsymbol{(21)}$$

$$B_{mn} = \frac{4}{ab\omega_{mn}} \int_0^a \int_0^b g(x, y) \sin\left(\frac{m\pi x}{a}\right) \sin\left(\frac{n\pi y}{b}\right) dx\, dy. \qquad\boldsymbol{(22)}$$

## 6. Physical Interpretation

### 6.1 Standing Wave Patterns

Each normal mode $u_{mn}(x, y, t)$ represents a **standing wave**:
- **Spatial pattern**: $\sin\left(\frac{m\pi x}{a}\right) \sin\left(\frac{n\pi y}{b}\right)$ has $m \times n$ nodal lines dividing the membrane into rectangular cells
- **Temporal oscillation**: All points oscillate in phase (or opposite phase) at frequency $\omega_{mn}$
- **Nodes**: Points where displacement is always zero

### 6.2 Characteristic Frequencies

The frequencies $\omega_{mn}$ are the **natural frequencies** or **resonant frequencies** of the membrane. They depend on:
- **Mode numbers** $(m, n)$: Higher modes have higher frequencies
- **Geometry**: Aspect ratio $a/b$ determines relative frequency spacing
- **Material properties**: Wave speed $c$ (tension and density)

For a **square membrane** ($a = b$), some modes are **degenerate**: different $(m, n)$ pairs can have the same frequency. For example, $(1, 2)$ and $(2, 1)$ have $\omega_{1,2} = \omega_{2,1}$.

### 6.3 Fundamental Mode

The **fundamental mode** $(m, n) = (1, 1)$ has the lowest frequency:

$$\omega_{1,1} = c\pi \sqrt{\frac{1}{a^2} + \frac{1}{b^2}}.$$

This mode has no internal nodes and represents the membrane oscillating as a single "drumhead."

## 7. Energy Considerations

### 7.1 Total Energy

The total energy of the membrane is the sum of kinetic and potential energies:

$$E(t) = \frac{1}{2} \int_0^a \int_0^b \left[u_t^2 + c^2(u_x^2 + u_y^2)\right] dx\, dy.$$

### 7.2 Energy Conservation

For the free oscillation (no external forces or damping), the total energy is conserved:

$$\frac{dE}{dt} = 0.$$

This can be verified by substituting the solution (18) and using the orthogonality of the modes.

### 7.3 Modal Energy

Each mode $(m, n)$ carries energy:

$$E_{mn} = \frac{ab}{4}(A_{mn}^2 + B_{mn}^2) \omega_{mn}^2.$$

The total energy is the sum of modal energies (no energy transfer between modes for the linear wave equation).

## 8. Comparison with 1D Wave Equation

The 2D wave equation exhibits fundamentally different behavior than the 1D case:

### 8.1 No d'Alembert-Type Solution

Unlike the 1D wave equation, the 2D equation does **not** admit a simple traveling wave solution of the form $u = f(x - ct, y - ct)$. The reason is geometric: wavefronts in 2D spread circularly, and energy is conserved over expanding circles, leading to amplitude decay $\propto 1/\sqrt{r}$, which does not satisfy the wave equation for arbitrary functions.

**Exception**: In 1D and 3D, traveling wave solutions exist due to special dimensional properties (Huygens' principle holds). In 2D, waves exhibit "tails"—disturbances persist after the main wavefront passes.

### 8.2 Standing Waves vs Traveling Waves

- **1D with fixed boundaries**: Solution is a superposition of standing waves (like 2D)
- **1D on infinite domain**: d'Alembert solution shows two traveling waves
- **2D with boundaries**: Only standing wave solutions exist (normal modes)
- **2D on infinite domain**: More complex behavior; Kirchhoff formula involves integrals over circles

### 8.3 Complexity of Mode Structure

The 2D normal modes have richer structure:
- **Nodal lines**: Form rectangular grids
- **Degeneracies**: Multiple modes can have the same frequency
- **Higher density of states**: Infinitely many mode pairs $(m, n)$

## 9. Interactive Demonstration

The simulation below visualizes the 2D wave equation solution in real time. You can select different initial conditions and mode combinations to see how the membrane vibrates.

**How to use**: Choose an initial shape, select which modes to include, adjust the wave speed, and observe the complex standing wave patterns that emerge!

[codeContainer](../scripts/blog-post-scripts/wave-equation-2d-demo.js)

## 10. Special Cases and Examples

### 10.1 Single Mode Excitation

If $f(x, y) = \sin\left(\frac{m_0\pi x}{a}\right) \sin\left(\frac{n_0\pi y}{b}\right)$ and $g(x, y) = 0$, then only mode $(m_0, n_0)$ is excited:

$$u(x, y, t) = \sin\left(\frac{m_0\pi x}{a}\right) \sin\left(\frac{n_0\pi y}{b}\right) \cos(\omega_{m_0,n_0} t).$$

The membrane oscillates in a single pure standing wave pattern.

### 10.2 Gaussian Initial Displacement

For a localized Gaussian bump:

$$f(x, y) = A \exp\left(-\frac{(x - x_0)^2 + (y - y_0)^2}{2\sigma^2}\right), \quad g(x, y) = 0,$$

the solution involves many modes. The coefficients $A_{mn}$ decay roughly as the Fourier transform of a Gaussian, so higher modes have smaller contributions. The wave spreads outward from the initial disturbance.

### 10.3 Corner Impulse

For an impulse at a corner (e.g., $(0, 0)$):

$$f(x, y) = 0, \quad g(x, y) = V \delta(x - \epsilon) \delta(y - \epsilon),$$

(with $\epsilon \to 0^+$), the coefficients become:

$$B_{mn} \propto \frac{1}{\omega_{mn}}.$$

This creates a superposition of all modes with decreasing amplitude at higher frequencies.

## 11. Numerical Considerations

### 11.1 Truncation

In practice, the infinite sums are truncated to a finite number of modes:

$$u^N(x, y, t) = \sum_{m=1}^{M} \sum_{n=1}^{N} u_{mn}(x, y, t).$$

The truncation error decreases as $M, N$ increase, typically as $O(1/M^2)$ for smooth initial conditions.

### 11.2 Computational Complexity

- **Coefficient computation**: $O(MN)$ double integrals, each requiring numerical quadrature
- **Solution evaluation**: $O(MN)$ terms per space-time point
- **Total**: For $P$ spatial points and $Q$ time steps, complexity is $O(MNPQ)$

### 11.3 Stability

The analytical solution is inherently stable—no numerical stability issues arise from the separation of variables method. However, computing the coefficients accurately requires care with:
- **Integration accuracy**: Use sufficient quadrature points
- **Round-off errors**: Accumulation in double sums
- **Aliasing**: Ensure spatial discretization resolves highest included modes

## 12. Extensions and Generalizations

### 12.1 Different Boundary Conditions

The method extends to other boundary conditions:
- **Free edges**: $u_x = 0$ or $u_y = 0$ (cosine modes)
- **Mixed**: Some edges fixed, others free
- **Periodic**: Yields complex exponential modes

### 12.2 Non-Rectangular Domains

For circular membranes, separation of variables in polar coordinates yields Bessel functions. The eigenfunctions are:

$$u_{mn}(r, \theta, t) = J_m(\alpha_{mn} r) \cos(m\theta) \cos(\omega_{mn} t),$$

where $J_m$ is the Bessel function of order $m$, and $\alpha_{mn}$ are its zeros.

### 12.3 Damping and Forcing

Adding damping ($\gamma u_t$) or external forcing ($h(x, y, t)$):

$$u_{tt} + 2\gamma u_t = c^2 (u_{xx} + u_{yy}) + h(x, y, t).$$

The modes still separate, but with damped oscillations ($e^{-\gamma t}$) and resonance behavior.

## 13. Conclusion

The two-dimensional wave equation on a rectangular domain admits elegant analytical solutions via separation of variables. The solution emerges as an infinite superposition of normal modes—standing wave patterns that oscillate at characteristic frequencies determined by the membrane's geometry and material properties.

Key takeaways:

1. **Separation of variables** reduces the PDE to three ODEs (one temporal, two spatial)
2. **Boundary conditions** quantize the allowed wavelengths, yielding discrete eigenvalues
3. **Normal modes** form a complete orthogonal basis for representing arbitrary initial conditions
4. **Characteristic frequencies** depend on mode numbers and domain geometry
5. **Energy conservation** emerges naturally; no energy transfer between modes

Unlike the 1D case with its simple d'Alembert solution, the 2D wave equation exhibits richer phenomena: nodal patterns, mode degeneracies, and complex interference. The interactive demonstration shows these wave patterns evolving in real time.

The mathematical framework developed here extends broadly to other wave systems: electromagnetic cavities, quantum particle-in-a-box, vibrating plates, and acoustics—wherever waves are confined to finite domains.

## References

1. Strauss, W. A. (2007). *Partial Differential Equations: An Introduction* (2nd ed.). Wiley. Chapter 4: The Wave Equation.

2. Haberman, R. (2012). *Applied Partial Differential Equations with Fourier Series and Boundary Value Problems* (5th ed.). Pearson. Chapter 12: Method of Separation of Variables.

3. Evans, L. C. (2010). *Partial Differential Equations* (2nd ed.). American Mathematical Society. Chapter 2: The Wave Equation.

4. Daileda, R. (2014). *The 2-D Wave Equation*. Trinity University Mathematics Lecture Notes. http://ramanujan.math.trinity.edu/rdaileda/teach/s14/m3357/lectures/lecture_3_4_slides.pdf

5. Feldman, J. (2024). *Wave Equation on a Two Dimensional Rectangle*. Johns Hopkins University. https://math.jhu.edu/~js/Math417/wave_2D.pdf

6. Courant, R., & Hilbert, D. (1962). *Methods of Mathematical Physics, Vol. II*. Wiley. Chapter V: Wave Equation in Higher Dimensions.

---

*Questions or corrections? Email me at adfield@wpi.edu*
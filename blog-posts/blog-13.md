---
title: "Weak Gravitational Lensing: From the Geodesic Equation to Mass Reconstruction"
date: "2025-12-03"
tags: "Astrophysics, Gravitational Lensing, Research"
snippet: "A rigorous derivation of weak gravitational lensing from first principles—starting with photon geodesics in curved spacetime and building to modern shear estimation techniques used in cosmological surveys."
---

# Weak Gravitational Lensing: From the Geodesic Equation to Mass Reconstruction

## Abstract

Gravitational lensing provides a direct probe of the matter distribution in the universe. We present a complete derivation of weak lensing theory from first principles, starting with the geodesic equation in curved spacetime, deriving the deflection angle in the weak-field limit, developing the thin-lens formalism, and constructing the convergence-shear formalism used in modern surveys. We connect the theoretical framework to practical observational challenges and discuss neural network approaches to shear estimation.

## 1. Motivation: Weighing the Invisible

Galaxy clusters are the largest gravitationally bound structures in the universe, with masses $M \sim 10^{14} - 10^{15} \, M_{\odot}$. Most of this mass ($\sim 85\%$) is **dark matter**, which does not emit, absorb, or scatter light. How do we measure it?

**Gravitational lensing** provides the answer: massive objects curve spacetime, and this curvature affects the paths of photons traveling from distant sources to us. By measuring these deflections, we can reconstruct the mass distribution—including dark matter.

This blog derives the theory from scratch and connects it to my research on neural network shear estimation (ShearNet).

## 2. Photon Propagation in Curved Spacetime

### 2.1 The Geodesic Equation

In general relativity, free particles (including photons) follow **geodesics** in spacetime, curves that extremize proper time (or affine parameter for null geodesics). The geodesic equation is:

$$\frac{d^2 x^\mu}{d\lambda^2} + \Gamma^\mu_{\alpha\beta}\frac{dx^\alpha}{d\lambda}\frac{dx^\beta}{d\lambda} = 0 \qquad\boldsymbol{(1)}$$

where $\lambda$ is an affine parameter, $x^\mu$ are spacetime coordinates, and $\Gamma^\mu_{\alpha\beta}$ are the Christoffel symbols:

$$\Gamma^\mu_{\alpha\beta} = \frac{1}{2}g^{\mu\nu}\left(\frac{\partial g_{\nu\alpha}}{\partial x^\beta} + \frac{\partial g_{\nu\beta}}{\partial x^\alpha} - \frac{\partial g_{\alpha\beta}}{\partial x^\nu}\right) \qquad\boldsymbol{(2)}$$

For photons, we have the additional constraint that the four-velocity is null:

$$g_{\mu\nu}\frac{dx^\mu}{d\lambda}\frac{dx^\nu}{d\lambda} = 0 \qquad\boldsymbol{(3)}$$

### 2.2 Weak-Field Metric

Consider a spacetime with weak gravitational fields. We write the metric as a perturbation around Minkowski space:

$$g_{\mu\nu} = \eta_{\mu\nu} + h_{\mu\nu}, \qquad |h_{\mu\nu}| \ll 1 \qquad\boldsymbol{(4)}$$

where $\eta_{\mu\nu} = \text{diag}(-1, 1, 1, 1)$ is the Minkowski metric.

For a **static, non-rotating** mass distribution with Newtonian potential $\Phi(\mathbf{x})$ (where $|\Phi| \ll c^2$), the weak-field metric to first order in $\Phi/c^2$ is:

$$ds^2 = -\left(1 + \frac{2\Phi}{c^2}\right)c^2 dt^2 + \left(1 - \frac{2\Phi}{c^2}\right)(dx^2 + dy^2 + dz^2) \qquad\boldsymbol{(5)}$$

In coordinates $(x^0, x^1, x^2, x^3) = (ct, x, y, z)$:

$$h_{00} = \frac{2\Phi}{c^2}, \qquad h_{ij} = -\frac{2\Phi}{c^2}\delta_{ij} \qquad\boldsymbol{(6)}$$

### 2.3 Spatial Components of the Geodesic Equation

For a photon traveling primarily in the $z$-direction with small transverse velocity, we parameterize the path as $\mathbf{x}(z) = (\xi_1(z), \xi_2(z), z)$ where $\boldsymbol{\xi} = (\xi_1, \xi_2)$ are transverse coordinates.

The spatial components of equation (1) give (to first order in $\Phi/c^2$):

$$\frac{d^2\xi_i}{dz^2} = -\frac{2}{c^2}\frac{\partial \Phi}{\partial \xi_i} \qquad (i = 1, 2) \qquad\boldsymbol{(7)}$$

**Derivation:** The Christoffel symbols contain terms like $\Gamma^i_{00} \sim \partial_i h_{00}$ and $\Gamma^i_{jj} \sim \partial_i h_{jj}$. For a photon with $dx^0/d\lambda \sim dx^3/d\lambda \gg dx^i/d\lambda$, the dominant contribution comes from:

$$\Gamma^i_{00} = \frac{1}{2}\eta^{ij}\frac{\partial h_{00}}{\partial x^j} = \frac{1}{c^2}\frac{\partial \Phi}{\partial \xi_i}$$

Substituting into the geodesic equation and using $\lambda \approx z/c$ (affine parameter approximately equal to coordinate distance for small deflections) gives equation (7).

### 2.4 Deflection Angle for a Point Mass

Consider a point mass $M$ at the origin. The Newtonian potential is:

$$\Phi(\mathbf{x}) = -\frac{GM}{|\mathbf{x}|} \qquad\boldsymbol{(8)}$$

For a photon with impact parameter $b$ (closest approach distance), traveling from $z = -\infty$ to $z = +\infty$, the total deflection angle is:

$$\boldsymbol{\hat{\alpha}} = -\frac{2}{c^2}\int_{-\infty}^{+\infty} \nabla_\perp \Phi \, dz \qquad\boldsymbol{(9)}$$

where $\nabla_\perp = (\partial/\partial \xi_1, \partial/\partial \xi_2)$ is the gradient in the transverse plane.

For $\Phi = -GM/r$ where $r = \sqrt{b^2 + z^2}$:

$$\frac{\partial \Phi}{\partial \xi_i} = \frac{GM \xi_i}{r^3}$$

The deflection in the radial direction (toward the mass) is:

$$\hat{\alpha} = -\frac{2}{c^2}\int_{-\infty}^{+\infty} \frac{GM b}{(b^2 + z^2)^{3/2}} dz \qquad\boldsymbol{(10)}$$

**Evaluating the integral:**

Let $z = b \tan\theta$, so $dz = b\sec^2\theta \, d\theta$ and $(b^2 + z^2)^{3/2} = b^3\sec^3\theta$:

$$\hat{\alpha} = -\frac{2GM}{c^2 b^2}\int_{-\pi/2}^{\pi/2} \cos\theta \, d\theta = -\frac{2GM}{c^2 b^2}[\sin\theta]_{-\pi/2}^{\pi/2} = -\frac{4GM}{c^2 b}$$

The magnitude of the deflection angle is:

$$\boxed{\hat{\alpha} = \frac{4GM}{c^2 b}} \qquad\boldsymbol{(11)}$$

This is **Einstein's result** from 1915, which famously differs by a factor of 2 from the Newtonian prediction (which neglects the spatial metric perturbation $h_{ij}$).

### 2.5 Extended Mass Distributions

For a general mass distribution with density $\rho(\mathbf{x})$, we use the **superposition principle**. The deflection angle at transverse position $\boldsymbol{\xi}$ is:

$$\boldsymbol{\hat{\alpha}}(\boldsymbol{\xi}) = \frac{4G}{c^2}\int \frac{(\boldsymbol{\xi} - \boldsymbol{\xi}')\rho(\boldsymbol{\xi}', z')}{|\boldsymbol{\xi} - \boldsymbol{\xi}'|^2} d^2\xi' \, dz' \qquad\boldsymbol{(12)}$$

### 2.6 Interactive Demo: Light Bending

Before proceeding to the thin-lens approximation, let's visualize the deflection:

[codeContainer](../scripts/blog-post-scripts/light-bending-demo.js)

**Physical check:** For the Sun ($M = M_{\odot}$, $b = R_{\odot}$), we get $\hat{\alpha} \approx 1.75''$, confirmed by Eddington in 1919.

## 3. The Thin-Lens Approximation

### 3.1 Motivation and Setup

In cosmological lensing, the lens (e.g., galaxy cluster) has thickness $\Delta z \sim 1 \text{ Mpc}$ but the distances involved are $D_L \sim 1000 \text{ Mpc}$. The ratio $\Delta z / D_L \sim 10^{-3} \ll 1$ justifies the **thin-lens approximation**: we treat the lens as a 2D mass sheet at a single distance.

**Geometry:**
- Observer at $O$
- Lens plane at comoving distance $D_L$ (angular diameter distance)
- Source plane at comoving distance $D_S$
- Lens-source distance $D_{LS} = D_S - D_L$ (in flat space)

We define:
- $\boldsymbol{\xi}$: physical transverse position in lens plane
- $\boldsymbol{\eta}$: physical transverse position in source plane
- $\boldsymbol{\theta} = \boldsymbol{\xi}/D_L$: angular position of image
- $\boldsymbol{\beta} = \boldsymbol{\eta}/D_S$: angular position of source

### 3.2 Projected Surface Density

Define the **surface mass density** (projected along line of sight):

$$\Sigma(\boldsymbol{\xi}) = \int_{-\infty}^{+\infty} \rho(\boldsymbol{\xi}, z) \, dz \qquad\boldsymbol{(13)}$$

The deflection angle (equation 12) becomes:

$$\boldsymbol{\hat{\alpha}}(\boldsymbol{\xi}) = \frac{4G}{c^2}\int \frac{(\boldsymbol{\xi} - \boldsymbol{\xi}')\Sigma(\boldsymbol{\xi}')}{|\boldsymbol{\xi} - \boldsymbol{\xi}'|^2} d^2\xi' \qquad\boldsymbol{(14)}$$

Converting to angular coordinates $\boldsymbol{\theta} = \boldsymbol{\xi}/D_L$:

$$\boldsymbol{\alpha}(\boldsymbol{\theta}) = \frac{4G}{c^2}\frac{1}{D_L}\int \frac{(\boldsymbol{\theta} - \boldsymbol{\theta}')\Sigma(D_L\boldsymbol{\theta}')}{|\boldsymbol{\theta} - \boldsymbol{\theta}'|^2} D_L^2 \, d^2\theta' \qquad\boldsymbol{(15)}$$

Simplifying:

$$\boldsymbol{\alpha}(\boldsymbol{\theta}) = \frac{4G D_L}{c^2}\int \frac{(\boldsymbol{\theta} - \boldsymbol{\theta}')\Sigma(D_L\boldsymbol{\theta}')}{|\boldsymbol{\theta} - \boldsymbol{\theta}'|^2} d^2\theta' \qquad\boldsymbol{(16)}$$

### 3.3 The Lens Equation

From simple geometry (similar triangles), the relationship between true source position $\boldsymbol{\beta}$ and observed image position $\boldsymbol{\theta}$ is:

$$\boldsymbol{\beta} = \boldsymbol{\theta} - \frac{D_{LS}}{D_S}\boldsymbol{\alpha}(\boldsymbol{\theta}) \qquad\boldsymbol{(17)}$$

**Derivation:** A photon at transverse position $\boldsymbol{\xi}$ in the lens plane is deflected by angle $\boldsymbol{\alpha}$. In the absence of lensing, it would reach position $\boldsymbol{\eta}_0 = \boldsymbol{\xi} \cdot D_S/D_L = D_S \boldsymbol{\theta}$ in the source plane. With lensing, the deflection causes it to reach:

$$\boldsymbol{\eta} = D_S\boldsymbol{\theta} - D_{LS}\boldsymbol{\alpha}$$

Dividing by $D_S$ gives equation (17).

This is the fundamental **lens equation** of gravitational lensing.

### 3.4 Scaled Deflection and Critical Surface Density

Define the **scaled deflection angle**:

$$\boldsymbol{\tilde{\alpha}}(\boldsymbol{\theta}) = \frac{D_{LS}}{D_S}\boldsymbol{\alpha}(\boldsymbol{\theta}) \qquad\boldsymbol{(18)}$$

And the **critical surface density**:

$$\Sigma_{\text{crit}} = \frac{c^2}{4\pi G}\frac{D_S}{D_L D_{LS}} \qquad\boldsymbol{(19)}$$

This is the surface density at which strong lensing (multiple images) occurs.

**Physical interpretation:** $\Sigma_{\text{crit}}$ sets the mass scale. For typical cosmological distances:

$$\Sigma_{\text{crit}} \sim 10^{15} \, M_{\odot} \text{ Mpc}^{-2} \sim 0.3 \text{ g cm}^{-2}$$

The lens equation becomes:

$$\boldsymbol{\beta} = \boldsymbol{\theta} - \boldsymbol{\tilde{\alpha}}(\boldsymbol{\theta}) \qquad\boldsymbol{(20)}$$

## 4. Lensing Potential and Convergence

### 4.1 The Lensing Potential

Equation (16) has the form of a 2D gravitational potential. Define the **lensing potential** (dimensionless):

$$\psi(\boldsymbol{\theta}) = \frac{D_{LS}}{D_L D_S}\frac{4G}{c^2}\int \Sigma(D_L\boldsymbol{\theta}') \ln|\boldsymbol{\theta} - \boldsymbol{\theta}'| \, d^2\theta' \qquad\boldsymbol{(21)}$$

**Key property:** The scaled deflection angle is the gradient of $\psi$:

$$\boldsymbol{\tilde{\alpha}}(\boldsymbol{\theta}) = \nabla \psi(\boldsymbol{\theta}) \qquad\boldsymbol{(22)}$$

**Proof:** Using $\nabla \ln|\boldsymbol{\theta}| = \boldsymbol{\theta}/|\boldsymbol{\theta}|^2$:

$$\frac{\partial}{\partial \theta_i}\int \ln|\boldsymbol{\theta} - \boldsymbol{\theta}'| f(\boldsymbol{\theta}') d^2\theta' = \int \frac{\theta_i - \theta_i'}{|\boldsymbol{\theta} - \boldsymbol{\theta}'|^2} f(\boldsymbol{\theta}') d^2\theta'$$

This matches equation (16) with appropriate substitutions.

### 4.2 Convergence

Taking the Laplacian of $\psi$:

$$\nabla^2 \psi(\boldsymbol{\theta}) = \frac{D_{LS}}{D_L D_S}\frac{4G}{c^2}\int \Sigma(D_L\boldsymbol{\theta}') \nabla^2 \ln|\boldsymbol{\theta} - \boldsymbol{\theta}'| d^2\theta'$$

Using $\nabla^2 \ln|\boldsymbol{\theta}| = 2\pi \delta^{(2)}(\boldsymbol{\theta})$:

$$\nabla^2 \psi(\boldsymbol{\theta}) = \frac{D_{LS}}{D_L D_S}\frac{8\pi G}{c^2}\Sigma(D_L\boldsymbol{\theta}) \qquad\boldsymbol{(23)}$$

Define the **(dimensionless) convergence**:

$$\boxed{\kappa(\boldsymbol{\theta}) = \frac{\Sigma(D_L\boldsymbol{\theta})}{\Sigma_{\text{crit}}}} \qquad\boldsymbol{(24)}$$

Substituting the definition of $\Sigma_{\text{crit}}$ (equation 19):

$$\nabla^2 \psi = 2\kappa \qquad\boldsymbol{(25)}$$

This is the **2D Poisson equation for lensing**. The convergence is directly proportional to the projected surface density.

## 5. The Jacobian Matrix and Shear

### 5.1 Linearized Lens Mapping

For small deflections ($|\boldsymbol{\tilde{\alpha}}| \ll 1$), we can expand the lens equation locally. The mapping from source plane to image plane is described by the **Jacobian matrix**:

$$\mathcal{A}_{ij}(\boldsymbol{\theta}) = \frac{\partial \beta_i}{\partial \theta_j} = \delta_{ij} - \frac{\partial \tilde{\alpha}_i}{\partial \theta_j} = \delta_{ij} - \psi_{,ij} \qquad\boldsymbol{(26)}$$

where $\psi_{,ij} = \partial^2 \psi/\partial \theta_i \partial \theta_j$.

In matrix form:

$$\mathcal{A} = \begin{pmatrix}
1 - \psi_{,11} & -\psi_{,12} \\
-\psi_{,21} & 1 - \psi_{,22}
\end{pmatrix} \qquad\boldsymbol{(27)}$$

### 5.2 Convergence and Shear Decomposition

The Jacobian can be decomposed into physically meaningful components. Define:

$$\kappa = \frac{1}{2}(\psi_{,11} + \psi_{,22}) = \frac{1}{2}\nabla^2\psi \qquad\boldsymbol{(28)}$$

$$\gamma_1 = \frac{1}{2}(\psi_{,11} - \psi_{,22}) \qquad\boldsymbol{(29)}$$

$$\gamma_2 = \psi_{,12} = \psi_{,21} \qquad\boldsymbol{(30)}$$

The Jacobian becomes:

$$\boxed{\mathcal{A} = \begin{pmatrix}
1 - \kappa - \gamma_1 & -\gamma_2 \\
-\gamma_2 & 1 - \kappa + \gamma_1
\end{pmatrix}} \qquad\boldsymbol{(31)}$$

**Physical interpretation:**
- $\kappa$: **Convergence** — isotropic magnification (conserves shape, changes size)
- $\gamma_1, \gamma_2$: **Shear components** — anisotropic distortion (changes shape)
- $\gamma = \sqrt{\gamma_1^2 + \gamma_2^2}$: **Shear magnitude**

### 5.3 Effect on Source Shapes

Consider a circular source with radius $r_s$. The image boundary is given by:

$$\begin{pmatrix} \theta_1 \\ \theta_2 \end{pmatrix} = \mathcal{A}^{-1}\begin{pmatrix} \beta_1 \\ \beta_2 \end{pmatrix}$$

For $\beta_1^2 + \beta_2^2 = r_s^2$, the image is an **ellipse** with semi-major and semi-minor axes determined by the eigenvalues of $\mathcal{A}^{-1}$.

The eigenvalues of $\mathcal{A}$ are:

$$\lambda_\pm = 1 - \kappa \mp \gamma \qquad\boldsymbol{(32)}$$

**Image distortion:** A circular source becomes an ellipse with axis ratio:

$$\frac{b}{a} = \frac{1 - \kappa - \gamma}{1 - \kappa + \gamma} \approx 1 - \frac{2\gamma}{1 - \kappa} \qquad (\text{for } \gamma \ll 1) \qquad\boldsymbol{(33)}$$

### 5.4 Shear Pattern Demo

[codeContainer](../scripts/blog-post-scripts/shear-pattern-demo.js)

**Observe:** For a circularly symmetric lens (e.g., point mass), the shear is **tangential**:
- $\gamma_1 = -\gamma \cos(2\phi)$
- $\gamma_2 = -\gamma \sin(2\phi)$

where $\phi$ is the azimuthal angle. This tangential alignment is the signature we observe.

## 6. Reduced Shear and Observables

### 6.1 The Reduced Shear

We cannot directly observe $\kappa$ (we don't know the unlensed size of galaxies). What we observe is the **reduced shear**:

$$g = \frac{\gamma}{1 - \kappa} \qquad\boldsymbol{(34)}$$

**Derivation from image ellipticity:** An intrinsically circular source ($\epsilon^s = 0$) produces an image with ellipticity:

$$\epsilon = \frac{a - b}{a + b} = \frac{(1-\kappa+\gamma) - (1-\kappa-\gamma)}{(1-\kappa+\gamma) + (1-\kappa-\gamma)} = \frac{2\gamma}{2(1-\kappa)} = \frac{\gamma}{1-\kappa} = g$$

More generally, for a source with intrinsic ellipticity $\epsilon^s$, the observed ellipticity is:

$$\epsilon^{\text{obs}} \approx \epsilon^s + g \qquad (\text{to first order}) \qquad\boldsymbol{(35)}$$

### 6.2 Weak Lensing Regime

**Weak lensing** is defined by:

$$\kappa, \gamma \ll 1 \qquad\boldsymbol{(36)}$$

In this regime:

$$g \approx \gamma \qquad\boldsymbol{(37)}$$

This is the regime relevant for cosmological surveys. Typical values:
- Strong lensing (multiple images): $\kappa \sim 1$, $\gamma \sim 0.1 - 1$
- Weak lensing: $\kappa \sim 0.01 - 0.1$, $\gamma \sim 0.01 - 0.05$

### 6.3 Statistical Detection

For a single galaxy with intrinsic ellipticity $\epsilon^s$ (unknown), we cannot distinguish shear from intrinsic shape. However, intrinsic ellipticities are **randomly oriented**:

$$\langle \epsilon^s \rangle = 0 \qquad\boldsymbol{(38)}$$

while lensing shear causes **coherent alignment**. Averaging over $N$ galaxies:

$$\langle \epsilon^{\text{obs}} \rangle = g + \frac{1}{N}\sum_{i=1}^N \epsilon^s_i \approx g \qquad (\text{for large } N) \qquad\boldsymbol{(39)}$$

The variance of the estimator is:

$$\sigma_g^2 = \frac{\sigma_\epsilon^2}{N} \qquad\boldsymbol{(40)}$$

where $\sigma_\epsilon \approx 0.3$ is the intrinsic ellipticity dispersion (measured for galaxies).

**Example:** To detect $g = 0.01$ at $5\sigma$:

$$N \gtrsim 25\left(\frac{\sigma_\epsilon}{g}\right)^2 \sim 25 \times 900 = 22{,}500 \text{ galaxies}$$

This is why weak lensing requires **large surveys**.

## 7. Mass Reconstruction: Inverting the Shear Field

### 7.1 Kaiser-Squires Inversion

Given shear measurements $\gamma(\boldsymbol{\theta})$ across the sky, can we reconstruct $\kappa(\boldsymbol{\theta})$ (and thus $\Sigma$)?

From equations (28)-(30):

$$\kappa = \frac{1}{2}\nabla^2 \psi$$
$$\gamma_1 = \frac{1}{2}(\psi_{,11} - \psi_{,22})$$
$$\gamma_2 = \psi_{,12}$$

This can be written as:

$$\gamma_1 = \frac{1}{2}(\partial_1^2 - \partial_2^2)\psi, \qquad \gamma_2 = \partial_1\partial_2 \psi \qquad\boldsymbol{(41)}$$

Taking Fourier transforms (define $\tilde{f}(\mathbf{k}) = \int f(\boldsymbol{\theta}) e^{i\mathbf{k}\cdot\boldsymbol{\theta}} d^2\theta$):

$$\tilde{\kappa}(\mathbf{k}) = -\frac{k^2}{2}\tilde{\psi}(\mathbf{k})$$
$$\tilde{\gamma}_1(\mathbf{k}) = -\frac{1}{2}(k_1^2 - k_2^2)\tilde{\psi}(\mathbf{k})$$
$$\tilde{\gamma}_2(\mathbf{k}) = -k_1 k_2 \tilde{\psi}(\mathbf{k})$$

Eliminating $\tilde{\psi}$:

$$\boxed{\tilde{\kappa}(\mathbf{k}) = \frac{k_1^2 - k_2^2}{k^2}\tilde{\gamma}_1(\mathbf{k}) + \frac{2k_1 k_2}{k^2}\tilde{\gamma}_2(\mathbf{k})} \qquad\boldsymbol{(42)}$$

This is the **Kaiser-Squires (1993) inversion formula**. Given the shear field, we can reconstruct the convergence (and thus mass) via Fourier transform!

### 7.2 Real-Space Inversion

Fourier transforming equation (42) back to real space gives an integral:

$$\kappa(\boldsymbol{\theta}) = \frac{1}{\pi}\int d^2\theta' \, \mathcal{D}(\boldsymbol{\theta} - \boldsymbol{\theta}') \gamma_+(\boldsymbol{\theta}') \qquad\boldsymbol{(43)}$$

where $\gamma_+ = \gamma_1 \cos(2\phi) + \gamma_2 \sin(2\phi)$ is the tangential shear component and $\mathcal{D}$ is a kernel.

**In practice:** Real-space methods are sensitive to survey boundaries; Fourier methods handle boundaries better but require windowing.

### 7.3 Mass Reconstruction Demo

[codeContainer](../scripts/blog-post-scripts/mass-reconstruction-demo.js)

**Note the smoothing!** Real reconstructions balance:
- **Resolution:** High $k$ modes → fine structure
- **Noise:** High $k$ amplifies measurement errors

Optimal filtering (Wiener filtering) balances signal-to-noise.

## 8. Cosmological Context and the Limber Approximation

### 8.1 Generalization to Cosmology

In cosmology, both the lens and sources are distributed over a range of redshifts. For a source at comoving distance $\chi_s$ and lens at $\chi_l$, the effective lensing efficiency is:

$$g(\chi_l, \chi_s) = \frac{\chi_s - \chi_l}{\chi_s} \qquad (\text{for } \chi_l < \chi_s) \qquad\boldsymbol{(44)}$$

The convergence at angle $\boldsymbol{\theta}$ due to matter between us and $\chi_s$ is:

$$\kappa(\boldsymbol{\theta}, \chi_s) = \int_0^{\chi_s} d\chi \, \frac{\chi_s - \chi}{\chi_s \chi} \frac{3\Omega_m H_0^2}{2c^2} \delta(\chi\boldsymbol{\theta}, \chi) a^{-1} \qquad\boldsymbol{(45)}$$

where $\delta(\mathbf{x}, \chi)$ is the matter overdensity and $a = 1/(1+z)$ is the scale factor.

### 8.2 Limber Approximation

For sources with a redshift distribution $n(z)$ (normalized: $\int n(z)dz = 1$), the observed convergence power spectrum is:

$$C_\kappa(\ell) = \int_0^{\chi_H} d\chi \, \frac{W^2(\chi)}{\chi^2} P_\delta\left(k = \frac{\ell}{\chi}, \chi\right) \qquad\boldsymbol{(46)}$$

where:
- $W(\chi)$ is the **lensing kernel** (weighted by source distribution)
- $P_\delta(k, z)$ is the 3D matter power spectrum
- $\ell$ is the 2D multipole (Fourier conjugate to $\boldsymbol{\theta}$)

This is the **Limber approximation** (valid for $\ell \gtrsim 10$, i.e., small angular scales).

**Physical meaning:** Lensing probes the matter power spectrum integrated along the line of sight.

## 9. Systematic Effects: From Theory to Practice

### 9.1 The Point Spread Function (PSF)

Telescopes convolve images with a **Point Spread Function** due to:
- Atmospheric seeing ($\sim 0.5'' - 1''$ FWHM for ground telescopes)
- Optical aberrations
- Pixelization

The observed image is:

$$I^{\text{obs}}(\boldsymbol{x}) = (I^{\text{true}} * \text{PSF})(\boldsymbol{x}) + \text{noise} \qquad\boldsymbol{(47)}$$

**Problem:** The PSF itself has ellipticity $e^{\text{PSF}}$, which mimics shear! Even if $e^{\text{PSF}} \sim 1\%$, this contaminates the lensing signal ($g \sim 1\%$).

**Requirements:** For Stage IV surveys (LSST, Euclid, Roman), PSF ellipticity must be known to $\Delta e^{\text{PSF}} \lesssim 10^{-4}$ — a factor of 100 below the signal!

### 9.2 Shape Measurement Methods

Traditional methods (e.g., **ngmix**, **im3shape**):
1. Model the galaxy as a Sérsic profile: $I(r) \propto \exp[-(r/r_e)^{1/n}]$
2. Fit for parameters: centroid, size $r_e$, ellipticity components $(e_1, e_2)$, flux
3. Simultaneously fit the PSF or deconvolve first
4. This is **slow** (minutes per galaxy on CPU) and makes model assumptions

### 9.3 Neural Network Approaches

**Idea:** Train a convolutional neural network (CNN) to map:

$$\text{Image pixels} \xrightarrow{\text{CNN}} (g_1, g_2, r_e, \text{flux}, \ldots)$$

**Advantages:**
- **Speed:** 1000× faster on GPUs (milliseconds per galaxy)
- **No model assumptions:** Network learns optimal features
- **Joint learning:** Can simultaneously learn PSF deconvolution

**Challenges:**
- Needs large training sets (simulated images)
- Must calibrate biases (networks can learn spurious correlations)
- Requires careful validation

## 10. My Research: ShearNet

### 10.1 Architecture

ShearNet is a residual CNN (inspired by ResNet) that takes $64 \times 64$ pixel galaxy images (already PSF-corrected) and outputs:

- Shear estimates $\hat{g}_1, \hat{g}_2$
- Galaxy size $r_e$
- Signal-to-noise ratio
- Flux

**Key innovation:** We use a **physics-informed loss function** that penalizes violations of symmetry properties (e.g., $g$ should transform correctly under rotation).

### 10.2 Metacalibration Implementation

To achieve the required precision, we implement **metacalibration** (Huff & Mandelbaum 2017):

1. **Deconvolve PSF** from observed image $I^{\text{obs}}$ to get $I^{\text{clean}}$
2. **Apply artificial shear** $g^{\text{test}}$ to $I^{\text{clean}}$ (known transformation)
3. **Reconvolve with PSF** and add noise
4. **Remeasure shear** $\hat{g}^{\text{out}}$
5. **Calibrate:** The response $R = \partial \hat{g}^{\text{out}}/\partial g^{\text{test}}$ tells us how to correct the original measurement

For a shear measurement $\hat{g}^{\text{raw}}$, the corrected estimate is:

$$\hat{g}^{\text{corrected}} = R^{-1} \hat{g}^{\text{raw}} \qquad\boldsymbol{(48)}$$

**Our implementation:** Use a separate **PSF-deconvolution network** before shear estimation network.

### 10.3 Performance

Preliminary results on simulated data:
- **Speed:** ~10,000 galaxies/minute on V100 GPU (vs. ~10/minute for ngmix)
- **Shear bias:** $|m| < 0.005$ (multiplicative), $|c| < 5 \times 10^{-4}$ (additive) after metacalibration
- **Requirements for LSST:** $|m| < 0.003$, $|c| < 2 \times 10^{-4}$

We're close but not there yet! Current work focuses on:
- Improving calibration for faint galaxies (SNR < 20)
- Handling blended galaxies (overlapping images)
- Validating on real data from HSC survey

## 11. Open Questions and Future Directions

### 11.1 Theoretical

- **Intrinsic alignments:** Galaxies near each other have correlated shapes due to tidal forces. This contaminates the shear signal and must be modeled.
- **Baryonic effects:** Gas, stars, and AGN feedback affect small-scale matter distribution. Can we constrain these from lensing?
- **Beyond Born approximation:** For strong lensing or high-$z$ sources, photons are deflected multiple times (ray-tracing needed).

### 11.2 Observational

- **PSF modeling:** Can we use stars plus machine learning to predict PSF to $10^{-4}$ accuracy?
- **Shear calibration:** Can metacalibration reach $10^{-3}$ precision on real data?
- **Blending:** 30% of galaxies in LSST will overlap. How do we measure their individual shears?

### 11.3 Computational

- **Scalability:** LSST will observe $10^{10}$ galaxies. Processing this on GPUs is feasible, but validation/calibration pipelines must scale too.
- **Real-time analysis:** Can we measure shear fast enough to guide observations (e.g., identify interesting clusters for spectroscopic follow-up)?

## 12. Summary

We've derived weak gravitational lensing from first principles:

1. **Geodesic equation** (GR) → photon deflection in curved spacetime
2. **Weak-field limit** → deflection angle $\hat{\alpha} = 4GM/(c^2 b)$
3. **Thin-lens approximation** → lens equation $\boldsymbol{\beta} = \boldsymbol{\theta} - D_{LS}/D_S \cdot \boldsymbol{\alpha}$
4. **Lensing potential** $\psi$ → convergence $\kappa = \frac{1}{2}\nabla^2\psi$, shear $\gamma_i$ from second derivatives
5. **Jacobian decomposition** → $\mathcal{A} = (1-\kappa)\mathbb{I} - \gamma \cdot (\text{traceless part})$
6. **Reduced shear** $g = \gamma/(1-\kappa)$ is the observable (from galaxy ellipticities)
7. **Kaiser-Squires inversion** → reconstruct $\kappa(\boldsymbol{\theta})$ from $\gamma(\boldsymbol{\theta})$ via Fourier transform
8. **Cosmological application** → constrain matter power spectrum, dark energy
9. **Systematics** → PSF correction, shear calibration (metacalibration), intrinsic alignments
10. **Neural networks** (ShearNet) → fast, accurate shear estimation for next-generation surveys

Weak lensing connects general relativity, cosmology, statistics, and machine learning—a truly interdisciplinary field at the frontier of astrophysics.

## 13. Challenge: Reconstruct a Cluster!

[codeContainer](../scripts/blog-post-scripts/lensing-challenge.js)

**Your task:** Design a galaxy cluster, measure the shear from background galaxies, and see if you can recover the mass distribution!

## References

1. **Schneider, P., Ehlers, J., & Falco, E. E. (1992).** *Gravitational Lenses*. Springer. — The definitive textbook.

2. **Bartelmann, M., & Schneider, P. (2001).** "Weak gravitational lensing." *Physics Reports*, 340(4-5), 291-472. [arXiv:astro-ph/9912508](https://arxiv.org/abs/astro-ph/9912508) — Comprehensive review.

3. **Dodelson, S. (2003).** *Modern Cosmology*. Academic Press. Chapter 9: Gravitational Lensing.

4. **Kaiser, N., & Squires, G. (1993).** "Mapping the dark matter with weak gravitational lensing." *ApJ*, 404, 441. — Original inversion formula.

5. **Mandelbaum, R. (2018).** "Weak Lensing for Precision Cosmology." *ARAA*, 56, 393. [arXiv:1710.03235](https://arxiv.org/abs/1710.03235)

6. **Huff, E., & Mandelbaum, R. (2017).** "Metacalibration: Direct Self-Calibration of Biases in Shear Measurement." [arXiv:1702.02600](https://arxiv.org/abs/1702.02600)

7. **Kilbinger, M. (2015).** "Cosmology with cosmic shear observations: a review." *Rep. Prog. Phys.*, 78, 086901. [arXiv:1411.0115](https://arxiv.org/abs/1411.0115)

8. **Weinberg, S. (1972).** *Gravitation and Cosmology*. Wiley. Section 11.8: Light deflection.

9. **Software:** [github.com/s-Sayan/ShearNet](https://github.com/s-Sayan/ShearNet)

---

**Questions or corrections?** Email: adfield@wpi.edu
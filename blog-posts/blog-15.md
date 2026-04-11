---
title: "Weak Lensing: Investigating Dark Matter in Galaxy Clusters"
date: "2026-04-06"
tags: "Astrophysics, Gravitational Lensing, Research"
snippet: "A companion blog to our undergraduate talk on weak gravitational lensing: covering dark matter motivation, the SuperBIT telescope, the full data pipeline from co-addition to mass reconstruction, and active research directions including ShearNet and FEMMI."
---

# Weak Lensing: Investigating Dark Matter in Galaxy Clusters

This post is a written companion to the talk I gave with my collaborator **Natalie** for Professor Källan Berglund's class, covering the weak gravitational lensing pipeline we worked on together with Northeastern University. The talk had two halves: Natalie presented the physics motivation, the nature of dark matter, and how gravitational lensing works conceptually, while I covered the computational pipeline and active research directions. I have tried to preserve that structure here. **Sections 1 through 4 cover Natalie's material** and closely follow her presentation, so the intellectual content, framing, and explanations there are hers. Sections 5 onwards cover my portion.

## 1. Why Study Dark Matter? *(Natalie's section)*

Stars, galaxies, nebulae, everything we can detect with telescopes across the entire electromagnetic spectrum, makes up only about **5% of the universe**. The remaining 95% consists of dark energy (around 68%) and dark matter (around 27%). We genuinely do not know what the bulk of the universe is made of.

Dark matter is worth studying because it is directly gravitationally influential. It shapes the large-scale structure of the cosmos: where galaxies form, how they cluster, how they evolve. Any complete theory of cosmology must account for it. The catch is that dark matter does not fit neatly into any category we have. It does not emit, absorb, or scatter light at any wavelength, which means every standard observational tool fails.

The only handle we have is **gravity**.

## 2. What is Dark Matter? *(Natalie's section)*

Dark matter is defined operationally by its gravitational effects on **baryonic matter**, the ordinary matter made of protons, neutrons, and electrons that we interact with every day. Stars, gas, dust: all baryonic. Dark matter is not.

The strongest evidence that something is there comes from galaxy clusters. When you add up all the visible mass in a galaxy cluster, every galaxy and every cloud of hot gas, you find that the total is far too small to keep the cluster bound. Given the expansion of the universe, the galaxies should be flying apart. They are not. The extra gravitational pull holding them together must come from something undetected, and we call that something dark matter.

Dark matter's interactions with baryonic matter appear to be primarily gravitational, which is both the challenge and the opportunity. The challenge is that we cannot directly image it. The opportunity is that gravity bends light, and we can observe that bending with precision.

## 3. Gravity and the Curvature of Spacetime *(Natalie's section)*

Before getting to lensing, it helps to briefly touch on general relativity's picture of gravity. Mass and energy curve spacetime, and freely-falling objects (including photons) follow **geodesics**, the straightest possible paths, through that curved geometry. A useful analogy is a rubber sheet: place a massive ball on it and the sheet dips; smaller objects rolling nearby curve toward it not because of a force acting at a distance, but because the geometry itself is warped.

For a black hole, this curvature becomes extreme. For a galaxy cluster, it is subtler but still measurable. Light traveling past a cluster does not travel in a straight line through flat space. It follows a curve, and that curve depends on how much mass is present and how it is distributed.

This is the key: **the path of light encodes information about the mass distribution it traversed.**

## 4. Gravitational Lensing and Shear *(Natalie's section)*

### 4.1 The Basic Lensing Geometry

Consider a distant background galaxy, a massive galaxy cluster partway between it and us, and our telescope. In the absence of the cluster, light from the background galaxy would travel in a straight line and we would infer its position correctly. With the cluster present, the light path bends. When we trace the arriving light rays back in straight lines (which is all a telescope does) we infer a source position that differs from where the galaxy actually is.

The interactive demo below lets you explore this geometry directly. Adjust the lens mas to see how the deflection angle changes, and watch how the apparent position diverges from the true one.

[codeContainer](../scripts/blog-post-scripts/light-deflection-demo.js)

*Demo 1: Light bending around a massive lens. The true source position and apparent position diverge because the deflection bends the path of light. At very small impact parameters, the two images on either side of the lens merge into an Einstein ring. Einstein's prediction for a solar-mass object at the solar radius is about 1.75 arcseconds of deflection, confirmed by Eddington in 1919.*

This apparent displacement is gravitational lensing. Its strength depends on how massive and concentrated the cluster is, and on the geometric distances involved (the angular diameter distances $D_L$, $D_S$, and $D_{LS}$). Formally, the **lens equation** relating true source position $\boldsymbol{\beta}$ to observed image position $\boldsymbol{\theta}$ is

$$\boldsymbol{\beta} = \boldsymbol{\theta} - \frac{D_{LS}}{D_S} \boldsymbol{\alpha}(\boldsymbol{\theta}), \qquad\boldsymbol{(1)}$$

where $\boldsymbol{\alpha}$ is the physical deflection angle. See my earlier post on [Weak Gravitational Lensing from first principles](https://adamfield.org/pages/blog.html?blog=Weak+Gravitational+Lensing%3A+From+the+Geodesic+Equation+to+Mass+Reconstruction) for the full derivation starting from the geodesic equation.

### 4.2 The Convergence and Shear

For a lens with projected surface mass density $\Sigma(\boldsymbol{\theta})$, we define the **convergence**

$$\kappa(\boldsymbol{\theta}) = \frac{\Sigma(D_L \boldsymbol{\theta})}{\Sigma_\mathrm{crit}}, \qquad \Sigma_\mathrm{crit} = \frac{c^2}{4\pi G} \frac{D_S}{D_L D_{LS}}. \qquad\boldsymbol{(2)}$$

The convergence governs isotropic magnification: a circular source seen through a region of high $\kappa$ appears larger but keeps its shape. What distorts the shape is **shear**, $\boldsymbol{\gamma} = (\gamma_1, \gamma_2)$, which comes from the anisotropic part of the lens mapping.

Both $\kappa$ and $\gamma$ are derived from the **lensing potential** $\psi(\boldsymbol{\theta})$, which satisfies the 2D Poisson equation

$$\nabla^2 \psi = 2\kappa. \qquad\boldsymbol{(3)}$$

The shear components are the traceless second derivatives of $\psi$:

$$\gamma_1 = \frac{1}{2}(\psi_{,11} - \psi_{,22}), \qquad \gamma_2 = \psi_{,12}. \qquad\boldsymbol{(4)}$$

The **Jacobian** of the lens mapping encapsulates both effects:

$$\mathcal{A} = \begin{pmatrix} 1 - \kappa - \gamma_1 & -\gamma_2 \\ -\gamma_2 & 1 - \kappa + \gamma_1 \end{pmatrix}. \qquad\boldsymbol{(5)}$$

A circular background source maps to an ellipse with axis ratio $(1-\kappa-\gamma)/(1-\kappa+\gamma)$, where $\gamma = \sqrt{\gamma_1^2 + \gamma_2^2}$. For a circularly symmetric lens, the shear pattern is tangential around the center (elongated in the azimuthal direction), which is the characteristic signature Natalie highlighted in the talk.

The demo below shows this tangential shear pattern for different mass configurations.

[codeContainer](../scripts/blog-post-scripts/shear-pattern-demo.js)

*Demo 2: Shear field for a point mass lens. Each ellipse's orientation indicates the direction of stretching; its elongation represents the shear magnitude $\gamma$. Note the characteristic tangential alignment around the lens center.*

### 4.3 Weak Lensing vs. Strong Lensing

When $\kappa, \gamma \ll 1$, we are in the **weak lensing** regime. Individual galaxy shapes are slightly distorted (typically $\gamma \sim 0.01$ to $0.05$) but not dramatically so. No arcs, no multiple images. In the **strong lensing** regime ($\kappa \sim 1$), multiple images and Einstein rings form, and the lens equation becomes highly nonlinear.

Our project works in the weak regime, which is far more statistically powerful. Weak lensing can be measured around any sufficiently massive structure across the sky, not just the handful of clusters massive enough to produce strong lensing.

## 5. The SuperBIT Telescope *(Natalie's section, with some additions)*

The data we worked with came from the **Super-pressure Balloon-borne Imaging Telescope (SuperBIT)**, a collaboration described in Shaaban et al. (2022), McCleary et. al. (2024), and Saha et al. (2026). The key innovation is the platform: a 0.5 m telescope lifted into the stratosphere by a pressurized balloon, floating at roughly **33 km altitude**, above approximately **98%** of the Earth's atmosphere (Saha et al. 2026).

At that altitude, atmospheric turbulence is negligible and there is no atmospheric absorption in the ultraviolet. This gives SuperBIT image quality approaching what you would get from a space telescope, at a fraction of the cost (the mission ran to approximately 5 million USD, extraordinarily cheap by space-science standards).

There is an interesting wrinkle about how SuperBIT observes that is the main subject of Paper I (Shaaban et al. 2022). Conventional wisdom says weak lensing surveys should observe at **red or near-infrared** wavelengths, to detect more high-redshift galaxies. SuperBIT does the opposite: it primarily observes at **blue wavelengths** in the F480W band (366 to 575 nm). This is counter-intuitive, but three effects combine to favor blue light in the stratosphere. The diffraction-limited PSF is smaller in the blue, making galaxies easier to resolve. The stratospheric sky background is dramatically lower in the blue compared to the near-infrared. And SuperBIT's Sony IMX-455 CMOS detector has superior quantum efficiency in the blue. Together, Shaaban et al. (2022) show that three hours of blue-band observations yields roughly three times as many usable lensing sources as the same time in a red band. It is a genuinely counter-intuitive result that took careful simulation to establish.

The trade-off with the balloon platform is some risk: the balloon membrane is thin, and there have historically been cases of balloon failure and telescope loss. But the cost structure makes this a viable risk for an observatory that can be reflown.

During the 2023 flight (launched from Wanaka, New Zealand on April 16, 2023), SuperBIT circumnavigated the Southern Hemisphere five times over 45 nights and imaged 30 merging galaxy clusters. For each cluster, the survey strategy consisted of **three hours per cluster in the F400W and F480W bands plus 90 minutes in F600W**, corresponding to roughly **36 exposures of 5 minutes each** in the primary science bands (Saha et al. 2026). Each exposure is saved as a **FITS file** (Flexible Image Transport System), which stores the pixel data alongside metadata: telescope pointing, exposure time, filter, and astrometric calibration. Because the science camera has no shutter, the team retained only frames acquired at sun elevations below -6.5 degrees to prevent solar contamination.

## 6. The Pipeline: From Raw Images to Mass Maps

### 6.1 Co-addition

Any single 5-minute exposure of a galaxy cluster field is noisy on its own. **Co-addition** (stacking) combines the roughly 36 frames into one deep image. In practice this is a weighted sum of the individual frames, aligned using the astrometric information in the FITS headers and with hot pixels masked out using pre-computed bad pixel maps (Saha et al. 2026).

The noise benefit is clear from basic statistics. If each pixel in a single frame has noise $\sigma$, stacking $N = 36$ independent frames reduces pixel noise as

$$\sigma_\mathrm{coadd} \sim \frac{\sigma}{\sqrt{N}}. \qquad\boldsymbol{(6)}$$

Going from one to 36 frames gives a factor of 6 improvement in depth, revealing faint background galaxies that are completely invisible in any individual exposure.

The demo below lets you explore this interactively.

[codeContainer](../scripts/blog-post-scripts/coadd-noise-demo.js)

*Figure 3: Co-addition noise reduction. A simulated galaxy field is shown as you stack more exposures. Each additional frame reduces pixel noise as $1/\sqrt{N}$, revealing fainter structure.*

### 6.2 Source Detection and De-blending

The co-added image contains sources (galaxies and stars) embedded in a noisy background. We run **Source Extractor** (Bertin & Arnouts 1996) to identify them. The algorithm detects connected regions of pixels exceeding some signal-to-noise threshold above the local background, assigns each source a position and rough shape, and outputs a catalog. Source detection is performed in the F480W band, with photometry in the other bands obtained in dual-image mode using the F480W detections as priors (Saha et al. 2026).

The first complication is **de-blending**: galaxies in projection often overlap, and it is not always clear whether two adjacent bright regions are one object or two. Source Extractor attempts to separate them based on the local flux topology, but this is an imperfect process. If two galaxies are incorrectly merged, the shape measurer later in the pipeline will fit the combined object and produce a systematically wrong ellipticity. Errors in this step alone can contribute percentage-level biases to the final shear catalog.

An additional complication is spurious detections around diffraction spikes from bright stars and around the brightest cluster galaxies. Saha et al. (2026) handle these by manually creating polygonal mask files around bright sources and excluding detections within them, rather than relying on automated cuts that would also discard real faint sources.

### 6.3 PSF Correction

Any real optical system blurs the images it forms. For a telescope, the **Point Spread Function (PSF)** describes how a true point source maps to a spatial intensity profile on the detector. The PSF is never a perfect delta function: diffraction, mirror aberrations, and tracking errors all broaden and distort it, and crucially it varies across the field of view.

This matters enormously for weak lensing because the PSF introduces spurious ellipticity. A perfectly round galaxy imaged through an elliptical PSF appears elliptical, exactly mimicking a shear signal. For SuperBIT, the median PSF FWHM across all exposures is about 0.46 arcseconds (Saha et al. 2026), and PSF ellipticity at the outer edges of the field can reach the few-percent level, comparable to the actual weak lensing shear we are trying to measure. Uncorrected, this completely contaminates the science.

The standard correction uses **stars** as calibration objects. Stars are unresolved point sources, so their observed profile is the PSF at their location. For each exposure, stars are identified from the size-magnitude diagram (the stellar locus is a flat horizontal feature at the PSF size, whereas galaxies are larger). The PSF model is fit spatially across the field using PSFEx (Bertin 2011), with 80% of selected stars used for fitting and 20% reserved for validation (Saha et al. 2026). The validated PSF model then deconvolves each galaxy stamp.

One subtlety with SuperBIT is that its stratospheric PSF has significant high-frequency structure, because there is no atmospheric seeing to smooth things out. Gaussian mixture models (used by NGMIX for forward modeling) do not fully capture this structure, but Saha et al. (2026) validate that the residuals fall within the "safe zone" for the science analysis.

### 6.4 Shape Measurement with NGMIX

With PSF-corrected galaxy stamps in hand, we run a **shape measurer**. The standard tool in this pipeline is **NGMIX** (Sheldon 2014), which fits a Gaussian mixture model to each galaxy's light profile across all exposures simultaneously via Bayesian forward modeling. The fit returns the ellipticity components $(e_1, e_2)$, the half-light radius, flux, and signal-to-noise ratio.

The ellipticity $(e_1, e_2)$ is related to the **reduced shear** $g_i = \gamma_i / (1 - \kappa)$ by

$$e_i^{\mathrm{obs}} \approx e_i^s + g_i, \qquad\boldsymbol{(7)}$$

where $e_i^s$ is the galaxy's **intrinsic shape**, the ellipticity it would have in the absence of lensing. This is the fundamental challenge of weak lensing: we cannot separate intrinsic shape from shear for a single galaxy.

The solution is statistics. Real galaxies have random intrinsic orientations, so $\langle e_i^s \rangle = 0$ over a large ensemble. Averaging over $N$ galaxies,

$$\langle e_i^{\mathrm{obs}} \rangle = g_i + \frac{1}{N} \sum e_i^s \approx g_i \qquad \text{for large } N. \qquad\boldsymbol{(8)}$$

The intrinsic ellipticity dispersion is $\sigma_e \approx 0.3$ per component. To detect a shear signal of $g \sim 0.01$ at $5\sigma$ significance, we need roughly

$$N \gtrsim 25 \left(\frac{\sigma_e}{g}\right)^2 \sim 22{,}500 \text{ galaxies.} \qquad\boldsymbol{(9)}$$

This is why weak lensing requires wide-field surveys with high source density. SuperBIT achieves an average effective source density of $n_{\mathrm{eff}} \approx 11$ arcmin⁻² across its 30 cluster targets (Saha et al. 2026).

### 6.5 Metacalibration

NGMIX, like any shape estimator, has **bias**: it does not return the true shear, but something systematically offset from it. Schematically,

$$\hat{g} = (1 + m)\, g_{\mathrm{true}} + c, \qquad\boldsymbol{(10)}$$

where $m$ is the multiplicative bias and $c$ is the additive bias.

**Metacalibration** (Huff & Mandelbaum 2017; Sheldon & Huff 2017) is an elegant self-calibration technique that measures this bias directly from the data. For each galaxy, NGMIX deconvolves the PSF from the observed image, applies a small artificial shear $\delta g = 0.01$ in each of four directions, and then reconvolves with a slightly dilated version of the PSF. Running the shape estimator on each artificially sheared image gives the **response matrix**

$$R^\gamma_{ij} = \frac{e^+_i - e^-_i}{\Delta \gamma_j}, \qquad\boldsymbol{(11)}$$

which encodes how sensitive the estimator is to shear. This is a property of the estimator and noise, not the astrophysics. The corrected shear is then

$$\langle \gamma \rangle \approx \langle R^\gamma \rangle^{-1} \left( \langle e \rangle - \langle c^{\mathrm{total}} \rangle \right). \qquad\boldsymbol{(12)}$$

Metacalibration works because real galaxies have no preferred orientation on average, so any average ellipticity must arise from shear. Saha et al. (2026) introduce a refinement: rather than using a single global response value, they compute the response in a 2D grid over signal-to-noise ratio and galaxy-to-PSF size ratio, assigning each galaxy a response from its grid cell. This gridded calibration reduces the overall multiplicative shear bias from about 6.3% to 1.1% in their fiducial simulations, with a final measured bias of $(1.1 \pm 7.8)$% on the real data.

### 6.6 Mass Map Reconstruction: Kaiser-Squires Inversion

After metacalibration, we have a catalog of calibrated shear estimates scattered across the field. The final scientific step is inverting this shear field back to a **convergence map** $\kappa(\boldsymbol{\theta})$, the projected mass distribution.

The relationship between $\kappa$ and $\boldsymbol{\gamma}$ is non-local in real space (it is a convolution) but simplifies enormously in Fourier space. The **Kaiser-Squires (1993)** inversion formula is

$$\tilde{\kappa}(\mathbf{k}) = \frac{k_1^2 - k_2^2}{k^2}\,\tilde{\gamma}_1(\mathbf{k}) + \frac{2k_1 k_2}{k^2}\,\tilde{\gamma}_2(\mathbf{k}), \qquad\boldsymbol{(13)}$$

where $\tilde{f}$ denotes the 2D Fourier transform. Given measured shear, we get the convergence at each Fourier mode by simple algebra: no matrix inversion, no iterative solver, just pointwise multiplication in Fourier space.

This inversion naturally separates the convergence into two independent maps. The **E-mode** (curl-free) captures the physically expected gravitational signal: a mass concentration produces a peak. The **B-mode** (divergence-free) cannot be produced by gravity at leading order. A large B-mode signals residual systematics. In the SuperBIT results, the E-mode showed a clear peak at the cluster center while the B-mode was consistent with noise, indicating systematics were roughly under control (Saha et al. 2026).

From the convergence map, we compute the **tangential shear profile** $\gamma_t(R)$ as a function of projected radius from the cluster center and fit it against a projected NFW (Navarro-Frenk-White) density profile

$$\rho(r) = \frac{\rho_s}{(r/r_s)(1 + r/r_s)^2}, \qquad\boldsymbol{(14)}$$

where $\rho_s$ is a characteristic density and $r_s$ is the scale radius. Fitting this profile to $\gamma_t(R)$ recovers the cluster mass $M_{200}$.

## 7. The Full Pipeline at a Glance

**Natalie's part (data context):**
- Galaxy cluster selected as lensing target
- SuperBIT observes at blue wavelengths in the stratosphere: roughly 36 times 5-minute exposures per primary science band

**Adam's part (computational pipeline):**
1. **Co-addition** — one deep image from stacked frames, noise $\propto 1/\sqrt{N}$
2. **Source detection** — Source Extractor finds galaxies, outputs catalog and stamps
3. **De-blending** — separate overlapping galaxies; mask bright star artifacts
4. **PSF estimation** — model PSF spatially from stars using PSFEx
5. **PSF deconvolution** — remove instrumental blur from galaxy stamps
6. **Shape measurement** — NGMIX fits ellipticity $(e_1, e_2)$, size, flux via Bayesian forward modeling
7. **Metacalibration** — measure response matrix $\mathcal{R}$, correct bias with gridded calibration
8. **Kaiser-Squires inversion** — $(\gamma_1, \gamma_2) \to \kappa(\boldsymbol{\theta})$ via Fourier space
9. **NFW profile fitting** — recover cluster mass $M_{200}$

## 8. Active Research

### 8.1 ShearNet

**ShearNet** is a neural-network-based shear estimator I have been developing with Dr. Sayan Saha at Northeastern, with the goal of replacing NGMIX as the shape measurer in the pipeline. The input is a PSF-corrected galaxy stamp and a PSF image; the outputs are the shear components $(g_1, g_2)$, half-light radius, and flux.

The main motivation is speed. NGMIX is a Bayesian forward modeler that takes on the order of minutes per thousand galaxies on CPU. A trained neural network running on GPU can process the same number in seconds, a speedup of 100 to 1000 times. Future surveys like LSST will observe billions of galaxies, so this kind of computational efficiency is non-negotiable.

We implement metacalibration as a training-time and inference-time correction, measuring the response of the network to artificially applied shear and correcting the raw output accordingly. Current results show multiplicative bias $|m| \lesssim 0.005$ after metacalibration, approaching but not yet meeting the LSST requirement of $|m| < 0.003$. Active work focuses on improving calibration for low signal-to-noise galaxies and handling blended sources.

### 8.2 FEMMI

**FEMMI** (Finite Element Mass Map Inversion) is my independent research project tackling the mass inversion step differently. Instead of the Fourier-space Kaiser-Squires approach, FEMMI uses the finite element method to solve the forward model directly on an unstructured mesh.

The algorithm works iteratively. Start with an initial guess at the convergence map $\kappa^{(0)}$. Solve the Poisson equation $\nabla^2 \psi = 2\kappa^{(0)}$ using FEM. Compute the predicted shear $\gamma^{(0)}$ from $\psi$ via equation (4). Compare predicted to observed shear, compute the residual, and update $\kappa$ using adjoint-based gradients with Tikhonov regularization. Repeat until convergence.

Advantages over Kaiser-Squires: FEMMI handles irregular survey boundaries naturally (no windowing artifacts), accommodates non-uniform galaxy density, and can incorporate physically motivated regularization. Disadvantages: it is much more computationally expensive and requires careful regularization to avoid overfitting noise.

### 8.3 Future Pipeline: My MQP

My undergraduate thesis project at WPI aims to build a complete end-to-end pipeline using neural networks. The components are a neural network source extractor and de-blender (detecting galaxies and separating overlapping sources in one step, replacing Source Extractor), a PSF deconvolution network called DeconvNet (largely built, benchmarking pending), ShearNet for shape measurement, and FEMMI for the inversion step.

Chaining these together produces a full pipeline from co-added telescope images to mass maps, driven predominantly by neural networks rather than classical algorithms. Whether this pipeline outperforms the classical one in practice (particularly for faint, blended, and low signal-to-noise sources) is the central scientific question.

## 9. Conclusions

Weak gravitational lensing offers one of the few direct, mass-model-independent probes of dark matter. By measuring the tiny coherent distortions that galaxy clusters imprint on the shapes of background galaxies, we can reconstruct the projected mass distribution, including the dark matter that contributes the majority of it.

The pipeline to do this is long. Telescope, co-addition, source detection, PSF correction, shape measurement, metacalibration, mass inversion, NFW fitting, cluster mass. Each step involves real complications (de-blending, PSF variability, shape noise, estimator bias) and each step is fertile ground for research. The SuperBIT collaboration has now processed 30 merging galaxy clusters from the 2023 flight, and Saha et al. (2026) present the resulting shape catalogs with a final multiplicative shear bias of $(1.1 \pm 7.8)$%.

Natalie's section gave the conceptual foundation: dark matter's gravitational nature, the spacetime curvature picture, and how lensing translates mass into observable galaxy shape distortions. My section covered the pipeline that extracts that information from telescope data, and the neural-network approaches that may make future surveys tractable.

If you have questions about any of this, feel free to reach out.

---

## References

1. **Shaaban, M. M., Gill, A. S., McCleary, J., et al. (2022).** "Weak Lensing in the Blue: A Counter-intuitive Strategy for Stratospheric Observations." *AJ*, 164, 245.

2. **McCleary, J. E., Everett, S. W., Shaaban, M. M., et al. (2023).** "Lensing in the Blue. II. Estimating the Sensitivity of Stratospheric Balloons to Weak Gravitational Lensing." AJ, 166, 134.

3. **Saha, S., McCleary, J. E., Everett, S. W., et al. (2026).** "Lensing in the Blue III: Weak Lensing Shape Catalogs of 30 Merging Galaxy Clusters." *arXiv:2603.18376*

4. **Bertin, E. & Arnouts, S. (1996).** "SExtractor: Software for source extraction." *A&AS*, 117, 393.

5. **Bertin, E. (2011).** PSFEx. Astronomical Data Analysis Software and Systems XX, 435.

6. **Sheldon, E. S. (2014).** "An implementation of Bayesian lensing shear measurement." *MNRAS*, 444, L25.

7. **Huff, E. & Mandelbaum, R. (2017).** "Metacalibration: Direct self-calibration of biases in shear measurement." *arXiv:1702.02600*

8. **Sheldon, E. S. & Huff, E. M. (2017).** "Practical Weak-lensing Shear Measurement with Metacalibration." *ApJ*, 841, 24.

9. **Kaiser, N. & Squires, G. (1993).** "Mapping the dark matter with weak gravitational lensing." *ApJ*, 404, 441.

10. **Navarro, J. F., Frenk, C. S., & White, S. D. M. (1997).** "A Universal Density Profile from Hierarchical Clustering." *ApJ*, 490, 493.

11. **Mandelbaum, R. (2018).** "Weak Lensing for Precision Cosmology." *ARAA*, 56, 393.

12. **ShearNet GitHub:** [github.com/s-Sayan/ShearNet](https://github.com/s-Sayan/ShearNet)

---

*Questions or corrections? Email me at adfield@wpi.edu*

---
title: "Deriving Schrödinger's Equation from First Principles"
date: "2025-11-29"
tags: "Quantum Mechanics, Mathematical Physics"
snippet: "A rigorous derivation of Schrödinger's equation starting from Hamilton's optics-mechanics analogy, through the Hamilton-Jacobi equation, to the wave equation of quantum mechanics."
---

# Deriving Schrödinger's Equation from First Principles

## Abstract

We derive the Schrödinger equation from classical mechanics by exploiting the deep analogy between geometric optics and particle mechanics discovered by Hamilton. Starting from the Hamilton-Jacobi equation and introducing a wave function ansatz, we show how quantum mechanics emerges naturally from requiring the variation of Hamilton's principal function to vanish. Interactive simulations illustrate key concepts including wavefronts of equal action and the wave nature of matter.

## 1. Historical Context

In 1834, William Rowan Hamilton discovered a profound mathematical analogy between the laws of geometric optics and classical mechanics. Both systems can be described by variational principles, and both exhibit similar mathematical structures. This analogy, dormant for nearly a century, became the foundation for Erwin Schrödinger's 1926 formulation of quantum mechanics.

The key insight: if light exhibits both wave and particle behavior, and if Hamilton's equations unite optics and mechanics, then perhaps matter itself has wave properties that can be described by a wave equation analogous to the optical wave equation.

## 2. Hamilton's Optics-Mechanics Analogy

### 2.1 Fermat's Principle in Optics

Light traveling through a medium with refractive index $n(\mathbf{r})$ follows a path that minimizes the optical path length:

$$\delta \int_A^B n(\mathbf{r}) \, ds = 0, \qquad\boldsymbol{(1)}$$

where $ds$ is an infinitesimal path element. The quantity $n(\mathbf{r}) \, ds$ represents the "optical distance."

### 2.2 Maupertuis' Principle in Mechanics

A particle moving in a potential $V(\mathbf{r})$ follows a path that extremizes the action:

$$\delta \int_A^B p \, ds = 0, \qquad\boldsymbol{(2)}$$

where $p = mv$ is the momentum magnitude. This is **Maupertuis' principle** (also called the principle of least action in abbreviated form).

### 2.3 The Analogy

Hamilton recognized the mathematical identity between these principles:

$$\text{Optics: } n(\mathbf{r}) \quad \longleftrightarrow \quad \text{Mechanics: } p(\mathbf{r})$$

$$\text{Optical path length} \quad \longleftrightarrow \quad \text{Mechanical action}$$

Just as wavefronts in optics are surfaces of constant optical path length (constant phase), **surfaces of constant action** in mechanics should represent some physical wave property of particles.

### 2.4 Interactive Demonstration: Wavefronts of Equal Action

The simulation below shows a particle traveling from point A to point B in a potential field. The colored surfaces represent **wavefronts of constant action** $S(\mathbf{r}, t)$ — analogous to wavefronts of constant phase in optics.

[codeContainer](../scripts/blog-post-scripts/action-wavefronts.js)

**Key Observation**: The particle trajectory is perpendicular to these action wavefronts, just as light rays are perpendicular to optical wavefronts. This suggests that particle motion might be described by waves whose phase is related to the classical action.

## 3. The Hamilton-Jacobi Equation

### 3.1 Hamilton's Principal Function

Hamilton introduced a function $S(\mathbf{r}, t)$ called the **principal function** or **Hamilton's characteristic function**, which satisfies:

$$\frac{\partial S}{\partial t} + H\left(\mathbf{r}, \nabla S, t\right) = 0, \qquad\boldsymbol{(3)}$$

where $H$ is the Hamiltonian. For a particle of mass $m$ in a potential $V(\mathbf{r})$:

$$H = \frac{p^2}{2m} + V(\mathbf{r}) = \frac{|\nabla S|^2}{2m} + V(\mathbf{r}), \qquad\boldsymbol{(4)}$$

where we've used the fundamental relation $\mathbf{p} = \nabla S$.

Substituting into equation (3):

$$\boxed{\frac{\partial S}{\partial t} + \frac{(\nabla S)^2}{2m} + V(\mathbf{r}) = 0} \qquad\boldsymbol{(5)}$$

This is the **Hamilton-Jacobi equation** — a partial differential equation for the action function.

### 3.2 Physical Meaning of $S$

The function $S(\mathbf{r}, t)$ has several interpretations:

1. **Generating function**: It generates canonical transformations in phase space
2. **Action integral**: Along the classical trajectory, $S = \int L \, dt$ where $L$ is the Lagrangian
3. **Phase of matter waves**: As we'll see, $S/\hbar$ becomes the phase of the quantum wave function

### 3.3 Surfaces of Constant Action

The surfaces $S(\mathbf{r}, t) = \text{constant}$ are analogous to wavefronts in optics. The gradient $\nabla S$ is perpendicular to these surfaces and points in the direction of the classical momentum:

$$\mathbf{p} = \nabla S$$

The classical trajectory is the path along which $S$ increases most rapidly.

## 4. The Wave Function Ansatz

### 4.1 Introducing Complex Waves

Following de Broglie's hypothesis that matter has wavelike properties with wavelength $\lambda = h/p$, we seek a wave equation. Classical optics suggests we should look for solutions of the form:

$$\psi(\mathbf{r}, t) = A(\mathbf{r}, t) e^{iS(\mathbf{r}, t)/\hbar}, \qquad\boldsymbol{(6)}$$

where:
- $A(\mathbf{r}, t)$ is the **amplitude** (real-valued)
- $S(\mathbf{r}, t)$ is Hamilton's principal function (real-valued)
- $\hbar = h/(2\pi)$ is the reduced Planck constant

This form is inspired by geometric optics, where electromagnetic waves are written as $\mathbf{E} = \mathbf{E}_0 e^{i\phi}$ with phase $\phi$.

### 4.2 Why This Form?

The exponential factor $e^{iS/\hbar}$ oscillates rapidly. The surfaces of constant phase are:

$$S(\mathbf{r}, t) = \text{constant}$$

These are precisely the surfaces of constant action we identified earlier! The wavelength is:

$$\lambda = \frac{2\pi\hbar}{|\nabla S|} = \frac{h}{p},$$

which is **de Broglie's relation**.

## 5. Computing Derivatives of $\psi$

Let's compute the spatial and temporal derivatives of $\psi$ to prepare for deriving the wave equation.

### 5.1 Spatial Gradient

$$\nabla \psi = \nabla\left(A e^{iS/\hbar}\right) = (\nabla A) e^{iS/\hbar} + A \cdot \frac{i}{\hbar}(\nabla S) e^{iS/\hbar}$$

$$= \left[\nabla A + \frac{i}{\hbar} A \nabla S\right] e^{iS/\hbar} \qquad\boldsymbol{(7)}$$

### 5.2 Laplacian

Computing $\nabla^2 \psi$:

$$\nabla^2 \psi = \nabla \cdot (\nabla \psi) = \nabla \cdot \left[\left(\nabla A + \frac{i}{\hbar} A \nabla S\right) e^{iS/\hbar}\right]$$

Using the product rule and simplifying (see Appendix A for full derivation):

$$\nabla^2 \psi = \left[\nabla^2 A + \frac{2i}{\hbar} \nabla A \cdot \nabla S + \frac{i}{\hbar} A \nabla^2 S - \frac{1}{\hbar^2} A (\nabla S)^2\right] e^{iS/\hbar} \qquad\boldsymbol{(8)}$$

### 5.3 Time Derivative

$$\frac{\partial \psi}{\partial t} = \frac{\partial}{\partial t}\left(A e^{iS/\hbar}\right) = \left[\frac{\partial A}{\partial t} + \frac{i}{\hbar} A \frac{\partial S}{\partial t}\right] e^{iS/\hbar} \qquad\boldsymbol{(9)}$$

## 6. Deriving the Time-Independent Schrödinger Equation

### 6.1 The Classical Limit

In the classical limit where $\hbar \to 0$, the phase $S/\hbar$ oscillates infinitely rapidly. The dominant contribution to the Laplacian (equation 8) comes from the term with the highest power of $1/\hbar$:

$$\nabla^2 \psi \approx -\frac{(\nabla S)^2}{\hbar^2} A e^{iS/\hbar} = -\frac{(\nabla S)^2}{\hbar^2} \psi \qquad\boldsymbol{(10)}$$

From the Hamilton-Jacobi equation (5), the energy is:

$$E = -\frac{\partial S}{\partial t} = \frac{(\nabla S)^2}{2m} + V \qquad\boldsymbol{(11)}$$

Therefore:

$$(\nabla S)^2 = 2m(E - V) \qquad\boldsymbol{(12)}$$

### 6.2 Rearranging into Wave Equation Form

Substituting (12) into (10):

$$\nabla^2 \psi = -\frac{2m(E - V)}{\hbar^2} \psi$$

Rearranging:

$$-\frac{\hbar^2}{2m} \nabla^2 \psi + V \psi = E \psi$$

This is the **time-independent Schrödinger equation**:

$$\boxed{\widehat{H} \psi = E \psi} \qquad\boldsymbol{(13)}$$

where the Hamiltonian operator is:

$$\widehat{H} = -\frac{\hbar^2}{2m} \nabla^2 + V(\mathbf{r}) \qquad\boldsymbol{(14)}$$

### 6.3 Physical Interpretation

We've derived this by requiring that:

1. The wave function has the form $\psi = A e^{iS/\hbar}$
2. In the classical limit, surfaces of constant phase coincide with surfaces of constant action
3. The phase satisfies the Hamilton-Jacobi equation

The operator $-\frac{\hbar^2}{2m}\nabla^2$ corresponds to kinetic energy, replacing $\frac{p^2}{2m}$ with the replacement $\mathbf{p} \to -i\hbar\nabla$.

## 7. The Full Time-Dependent Schrödinger Equation

### 7.1 Including Time Dependence

For time-dependent solutions, we separate variables:

$$\psi(\mathbf{r}, t) = \psi(\mathbf{r}) e^{-iEt/\hbar} \qquad\boldsymbol{(15)}$$

Taking the time derivative:

$$\frac{\partial \psi}{\partial t} = -\frac{iE}{\hbar} \psi(\mathbf{r}) e^{-iEt/\hbar} = -\frac{iE}{\hbar} \psi(\mathbf{r}, t)$$

From the time-independent equation (13):

$$E \psi = \widehat{H} \psi$$

Therefore:

$$\frac{\partial \psi}{\partial t} = -\frac{i}{\hbar} \widehat{H} \psi$$

Multiplying both sides by $i\hbar$:

$$\boxed{i\hbar \frac{\partial \psi}{\partial t} = \widehat{H} \psi = -\frac{\hbar^2}{2m} \nabla^2 \psi + V \psi} \qquad\boldsymbol{(16)}$$

This is the **time-dependent Schrödinger equation**.

### 7.2 The Role of $\hbar$

The appearance of $\hbar$ throughout these equations shows that quantum effects become important when:

- Action is comparable to $\hbar$
- Wavelength $\lambda = h/p$ is comparable to system size
- Energy uncertainty times time uncertainty is comparable to $\hbar$

In the limit $\hbar \to 0$, we recover classical mechanics.

## 8. Variational Derivation

### 8.1 The Variational Principle

An alternative, more rigorous derivation uses the **variational principle**. We seek wave functions $\psi$ that make the action functional stationary:

$$\delta S[\psi] = \delta \int \mathcal{L}(\psi, \nabla\psi, \dot{\psi}) \, d^3r \, dt = 0 \qquad\boldsymbol{(17)}$$

The quantum Lagrangian density is:

$$\mathcal{L} = \frac{i\hbar}{2}\left(\psi^* \frac{\partial \psi}{\partial t} - \psi \frac{\partial \psi^*}{\partial t}\right) - \frac{\hbar^2}{2m} \nabla\psi^* \cdot \nabla\psi - V|\psi|^2 \qquad\boldsymbol{(18)}$$

### 8.2 Euler-Lagrange Equations

Varying with respect to $\psi^*$ and requiring $\delta S = 0$ yields:

$$\frac{\partial \mathcal{L}}{\partial \psi^*} - \nabla \cdot \frac{\partial \mathcal{L}}{\partial(\nabla \psi^*)} - \frac{\partial}{\partial t} \frac{\partial \mathcal{L}}{\partial \dot{\psi}^*} = 0$$

Substituting the Lagrangian (18) and simplifying (see Appendix B):

$$i\hbar \frac{\partial \psi}{\partial t} = -\frac{\hbar^2}{2m} \nabla^2 \psi + V \psi$$

We recover the Schrödinger equation from a variational principle, confirming that **quantum mechanics is a field theory** where $\psi$ is the field variable.

## 9. Interactive Visualization: From Classical to Quantum

The simulation below shows the transition from classical particle trajectories to quantum wave functions. Adjust $\hbar$ to see how quantum effects emerge.

[codeContainer](../scripts/blog-post-scripts/classical-to-quantum.js)

**Key Observations**:

1. **Large $\hbar$**: Strong wave behavior, significant spreading, interference patterns
2. **Small $\hbar$**: Wave packet follows classical trajectory closely
3. **Classical limit** ($\hbar \to 0$): Wave packet becomes a point particle

## 10. Connection to the Correspondence Principle

### 10.1 The WKB Approximation

In the semiclassical regime, we can use the **WKB (Wentzel-Kramers-Brillouin) approximation**:

$$\psi(\mathbf{r}) = A(\mathbf{r}) e^{iS(\mathbf{r})/\hbar} \qquad\boldsymbol{(19)}$$

Substituting into the time-independent Schrödinger equation and separating real and imaginary parts yields:

**Real part** (leading order in $\hbar$):
$$(\nabla S)^2 = 2m(E - V)$$

This is exactly the Hamilton-Jacobi equation! The classical action emerges as the phase of the quantum wave function.

**Imaginary part** (next order in $\hbar$):
$$\nabla^2 S + 2\frac{\nabla A}{A} \cdot \nabla S = 0$$

This gives a **continuity equation** for $|A|^2$, which relates to probability conservation.

### 10.2 Bohr's Correspondence Principle

As quantum numbers become large (high energy, large spatial extent), quantum mechanics must reduce to classical mechanics. Our derivation shows this explicitly:

- Quantum: $i\hbar \frac{\partial \psi}{\partial t} = \widehat{H} \psi$
- Classical limit ($\hbar \to 0$): Hamilton-Jacobi equation

The Schrödinger equation **interpolates** between the wave equation (for small $\hbar$, quantum regime) and the Hamilton-Jacobi equation (for large $\hbar$, classical regime).

## 11. Physical Interpretation of the Wave Function

### 11.1 Born's Probability Interpretation

Max Born (1926) proposed that $|\psi(\mathbf{r}, t)|^2$ represents the **probability density** for finding the particle at position $\mathbf{r}$ at time $t$:

$$P(\mathbf{r}, t) = |\psi(\mathbf{r}, t)|^2 = \psi^* \psi \qquad\boldsymbol{(20)}$$

This requires normalization:

$$\int_{-\infty}^{\infty} |\psi(\mathbf{r}, t)|^2 \, d^3r = 1 \qquad\boldsymbol{(21)}$$

### 11.2 Probability Current

From the Schrödinger equation, we can derive a continuity equation:

$$\frac{\partial}{\partial t}|\psi|^2 + \nabla \cdot \mathbf{j} = 0 \qquad\boldsymbol{(22)}$$

where the **probability current** is:

$$\mathbf{j} = \frac{\hbar}{2mi}\left(\psi^* \nabla \psi - \psi \nabla \psi^*\right) = \frac{\hbar}{m} \text{Im}(\psi^* \nabla \psi) \qquad\boldsymbol{(23)}$$

This shows that probability is conserved locally, just like charge or mass in classical physics.

### 11.3 Momentum and the Phase Gradient

The local momentum density is related to the gradient of the phase:

$$\mathbf{p}(\mathbf{r}) = \nabla S(\mathbf{r}) = \hbar \nabla \phi(\mathbf{r})$$

where $\phi = S/\hbar$ is the phase. This connects:
- Classical mechanics: $\mathbf{p} = \nabla S$
- Quantum mechanics: $\langle \mathbf{p} \rangle = -i\hbar \int \psi^* \nabla \psi \, d^3r$

## 12. Example Solutions

### 12.1 Free Particle

For $V = 0$, the Schrödinger equation becomes:

$$i\hbar \frac{\partial \psi}{\partial t} = -\frac{\hbar^2}{2m} \nabla^2 \psi$$

Plane wave solutions:

$$\psi(\mathbf{r}, t) = A e^{i(\mathbf{k} \cdot \mathbf{r} - \omega t)} \qquad\boldsymbol{(24)}$$

with dispersion relation:

$$E = \hbar\omega = \frac{\hbar^2 k^2}{2m} = \frac{p^2}{2m}$$

This confirms de Broglie's relations: $p = \hbar k$ and $E = \hbar \omega$.

### 12.2 Particle in a Box

For an infinite square well with $V = 0$ for $0 < x < L$ and $V = \infty$ elsewhere:

$$\psi_n(x) = \sqrt{\frac{2}{L}} \sin\left(\frac{n\pi x}{L}\right), \quad E_n = \frac{n^2 \pi^2 \hbar^2}{2mL^2} \qquad\boldsymbol{(25)}$$

**Quantization** emerges naturally: only discrete energies are allowed due to boundary conditions.

### 12.3 Harmonic Oscillator

For $V = \frac{1}{2}m\omega^2 x^2$:

$$E_n = \hbar\omega\left(n + \frac{1}{2}\right), \quad n = 0, 1, 2, \ldots \qquad\boldsymbol{(26)}$$

The zero-point energy $E_0 = \frac{1}{2}\hbar\omega$ has no classical analog — a purely quantum effect arising from the uncertainty principle.

## 13. The Path Integral Formulation (Preview)

### 13.1 Feynman's Approach

Richard Feynman showed that the wave function can be computed by summing over **all possible paths**:

$$\psi(\mathbf{r}_B, t_B) = \int \mathcal{D}[\mathbf{r}(t)] \, e^{iS[\mathbf{r}(t)]/\hbar} \psi(\mathbf{r}_A, t_A) \qquad\boldsymbol{(27)}$$

where $S[\mathbf{r}(t)] = \int L \, dt$ is the classical action functional.

This formulation makes Hamilton's analogy explicit: the phase of each path contribution is $S/\hbar$, directly connecting to our wave function ansatz (6).

### 13.2 Stationary Phase Approximation

In the classical limit $\hbar \to 0$, the integral is dominated by paths where $\delta S = 0$ — precisely the classical trajectory. This is the **principle of stationary phase**.

For finite $\hbar$, nearby paths contribute with different phases, creating quantum interference and wave phenomena.

## 14. Conclusion

We have derived the Schrödinger equation from first principles, starting with Hamilton's optics-mechanics analogy and the Hamilton-Jacobi equation. The key steps were:

1. **Hamilton-Jacobi equation**: Classical particles satisfy $\frac{\partial S}{\partial t} + \frac{(\nabla S)^2}{2m} + V = 0$

2. **Wave ansatz**: Inspired by optics, we proposed $\psi = A e^{iS/\hbar}$

3. **Classical limit**: Required that surfaces of constant phase match surfaces of constant action

4. **Wave equation**: Computing derivatives and taking the classical limit yielded the Schrödinger equation

5. **Variational principle**: Confirmed the result by requiring $\delta S[\psi] = 0$

The Schrödinger equation is not arbitrary — it emerges necessarily from:
- De Broglie's matter waves: $\lambda = h/p$
- Hamilton's optics-mechanics analogy
- The correspondence principle: quantum → classical as $\hbar \to 0$

**Key insights**:
- Quantum mechanics is a **wave theory** of matter
- The phase of the wave function is the classical action divided by $\hbar$
- Operators replace classical observables: $\mathbf{p} \to -i\hbar\nabla$, $E \to i\hbar\frac{\partial}{\partial t}$
- Probability interpretation emerges from the wave nature and Born's postulate

The equation $i\hbar \frac{\partial \psi}{\partial t} = \widehat{H} \psi$ is as fundamental to quantum mechanics as Newton's $F = ma$ is to classical mechanics — but it describes waves in an abstract Hilbert space rather than particles in physical space.

## Appendix A: Detailed Laplacian Calculation

Starting from equation (7):

$$\nabla \psi = \left[\nabla A + \frac{i}{\hbar} A \nabla S\right] e^{iS/\hbar}$$

The Laplacian is:

$$\nabla^2 \psi = \nabla \cdot (\nabla \psi)$$

Expanding using the product rule:

$$\nabla^2 \psi = \nabla \cdot \left[\left(\nabla A + \frac{i}{\hbar} A \nabla S\right) e^{iS/\hbar}\right]$$

$$= \left[\nabla^2 A + \frac{i}{\hbar} \nabla A \cdot \nabla S + \frac{i}{\hbar} A \nabla^2 S + \frac{i}{\hbar} \nabla S \cdot \nabla A - \frac{1}{\hbar^2} A (\nabla S)^2\right] e^{iS/\hbar}$$

Combining like terms:

$$\nabla^2 \psi = \left[\nabla^2 A + \frac{2i}{\hbar} \nabla A \cdot \nabla S + \frac{i}{\hbar} A \nabla^2 S - \frac{1}{\hbar^2} A (\nabla S)^2\right] e^{iS/\hbar}$$

## Appendix B: Variational Derivation Details

The quantum Lagrangian density is:

$$\mathcal{L} = \frac{i\hbar}{2}\left(\psi^* \dot{\psi} - \psi \dot{\psi}^*\right) - \frac{\hbar^2}{2m} |\nabla\psi|^2 - V|\psi|^2$$

Computing the functional derivatives:

$$\frac{\partial \mathcal{L}}{\partial \psi^*} = \frac{i\hbar}{2} \dot{\psi} - V\psi$$

$$\frac{\partial \mathcal{L}}{\partial(\nabla \psi^*)} = -\frac{\hbar^2}{2m} \nabla\psi$$

$$\frac{\partial \mathcal{L}}{\partial \dot{\psi}^*} = -\frac{i\hbar}{2} \psi$$

The Euler-Lagrange equation:

$$\frac{\partial \mathcal{L}}{\partial \psi^*} - \nabla \cdot \frac{\partial \mathcal{L}}{\partial(\nabla \psi^*)} - \frac{\partial}{\partial t}\frac{\partial \mathcal{L}}{\partial \dot{\psi}^*} = 0$$

Substituting:

$$\frac{i\hbar}{2} \dot{\psi} - V\psi + \frac{\hbar^2}{2m} \nabla^2 \psi + \frac{i\hbar}{2} \dot{\psi} = 0$$

Simplifying:

$$i\hbar \dot{\psi} = -\frac{\hbar^2}{2m} \nabla^2 \psi + V\psi$$

This is the Schrödinger equation.

## References

1. Schrödinger, E. (1926). "An Undulatory Theory of the Mechanics of Atoms and Molecules." *Physical Review* 28(6): 1049–1070.

2. de Broglie, L. (1924). "Recherches sur la théorie des quanta" (Researches on the quantum theory). PhD thesis, University of Paris.

3. Dirac, P. A. M. (1930). *The Principles of Quantum Mechanics*. Oxford University Press.

4. Feynman, R. P., Hibbs, A. R. (1965). *Quantum Mechanics and Path Integrals*. McGraw-Hill.

5. Landau, L. D., Lifshitz, E. M. (1977). *Quantum Mechanics: Non-Relativistic Theory* (3rd ed.). Pergamon Press.

6. Goldstein, H., Poole, C., Safko, J. (2002). *Classical Mechanics* (3rd ed.). Addison-Wesley. Chapter 10: Hamilton-Jacobi Theory.

7. Griffiths, D. J., Schroeter, D. F. (2018). *Introduction to Quantum Mechanics* (3rd ed.). Cambridge University Press.

8. Bohm, D. (1952). "A Suggested Interpretation of the Quantum Theory in Terms of 'Hidden' Variables." *Physical Review* 85(2): 166–193.

---

*Questions or corrections? Email me at adfield@wpi.edu*
---
title: "Solving the 1D Wave Equation: Classical and Transform Methods"
date: "2025-11-28"
tags: Mathematics, Wave Mechanics
snippet: "Analytical solutions to the 1D wave equation via d'Alembert and Fourier–Laplace methods, with interactive visualization."
---

# Solving the 1D Wave Equation: Classical and Transform Methods

## Abstract

We derive the analytical solution to the one-dimensional wave equation by two routes—d'Alembert's characteristic method and Fourier–Laplace transforms—and show they produce the same d'Alembert formula for general initial displacement $u_0$ and velocity $v_0$. Assuming causality ($u=0$ for $t<0$) and sufficient spatial decay for $u_0, v_0$, we highlight physical interpretation, special cases (pluck, impulse, Gaussian), and provide an interactive demo to visualize propagation.

## 1. Problem Statement

Let $u : \mathbb{R} \times \mathbb{R}^+ \to \mathbb{R}$ be the solution to the one-dimensional wave equation defined by

$$u_{tt} = c^2 u_{xx}, \qquad\boldsymbol{(1)}$$

where $c \in \mathbb{R}^+$ is the wave speed. 

**Assumptions:** We assume that $u \to 0$ as $x \to \pm\infty$ with sufficient decay (i.e., $u_0, v_0 \in L^1(\mathbb{R})$ or faster decay) to ensure convergence of Fourier transforms. We also enforce causality: $u \equiv 0$ for $t < 0$, which justifies using the Laplace transform in time and naturally handles initial conditions.

Initial conditions are specified as:
- Initial displacement: $u(x,0) = u_0(x)$
- Initial velocity: $u_t(x,0) = v_0(x)$

We will solve this problem using two distinct methods and show they yield equivalent results.

## 2. Method I: Classical d'Alembert Solution

### 2.1 Change of Variables

The wave equation is invariant under the characteristic transformation. Define new variables:

$$\xi = x - ct, \qquad \eta = x + ct. \qquad\boldsymbol{(2)}$$

These represent trajectories moving at speed $c$ to the right ($\xi = \text{const}$) and left ($\eta = \text{const}$) in the $(x,t)$ plane.

Then by the chain rule:

$$\frac{\partial}{\partial x} = \frac{\partial}{\partial \xi} + \frac{\partial}{\partial \eta}, \qquad \frac{\partial}{\partial t} = -c\frac{\partial}{\partial \xi} + c\frac{\partial}{\partial \eta}.$$

Computing second derivatives:

$$\frac{\partial^2}{\partial x^2} = \frac{\partial^2}{\partial \xi^2} + 2\frac{\partial^2}{\partial \xi \partial \eta} + \frac{\partial^2}{\partial \eta^2}, \qquad\boldsymbol{(3)}$$

$$\frac{\partial^2}{\partial t^2} = c^2\frac{\partial^2}{\partial \xi^2} - 2c^2\frac{\partial^2}{\partial \xi \partial \eta} + c^2\frac{\partial^2}{\partial \eta^2}. \qquad\boldsymbol{(4)}$$

Substituting (3) and (4) into the wave equation (1):

$$c^2\frac{\partial^2 u}{\partial \xi^2} - 2c^2\frac{\partial^2 u}{\partial \xi \partial \eta} + c^2\frac{\partial^2 u}{\partial \eta^2} = c^2\left(\frac{\partial^2 u}{\partial \xi^2} + 2\frac{\partial^2 u}{\partial \xi \partial \eta} + \frac{\partial^2 u}{\partial \eta^2}\right).$$

Simplifying:

$$-4c^2\frac{\partial^2 u}{\partial \xi \partial \eta} = 0 \implies \frac{\partial^2 u}{\partial \xi \partial \eta} = 0. \qquad\boldsymbol{(5)}$$

### 2.2 General Solution

Equation (5) implies that

$$\frac{\partial u}{\partial \eta} = g(\eta),$$

for some function $g$. Integrating with respect to $\eta$:

$$u(\xi, \eta) = f(\xi) + G(\eta),$$

where $G'(\eta) = g(\eta)$. Converting back to $(x,t)$ coordinates:

$$u(x,t) = f(x-ct) + G(x+ct). \qquad\boldsymbol{(6)}$$

This is **d'Alembert's general solution**: the sum of a right-traveling wave $f(x-ct)$ and a left-traveling wave $G(x+ct)$.

**Takeaway:** The solution splits into two waves whose shapes are fixed—one traveling right, one traveling left.

### 2.3 Applying Initial Conditions

At $t = 0$:

$$u(x,0) = f(x) + G(x) = u_0(x), \qquad\boldsymbol{(7)}$$

$$u_t(x,0) = -cf'(x) + cG'(x) = v_0(x). \qquad\boldsymbol{(8)}$$

From (8):

$$-f'(x) + G'(x) = \frac{v_0(x)}{c}. \qquad\boldsymbol{(9)}$$

Integrating (9):

$$-f(x) + G(x) = \frac{1}{c}\int_0^x v_0(\xi) \, d\xi + K, \qquad\boldsymbol{(10)}$$

where $K$ is a constant of integration. Adding equations (7) and (10):

$$2G(x) = u_0(x) + \frac{1}{c}\int_0^x v_0(\xi) \, d\xi + K.$$

Therefore:

$$G(x) = \frac{1}{2}u_0(x) + \frac{1}{2c}\int_0^x v_0(\xi) \, d\xi + \frac{K}{2}. \qquad\boldsymbol{(11)}$$

Subtracting (10) from (7):

$$2f(x) = u_0(x) - \frac{1}{c}\int_0^x v_0(\xi) \, d\xi - K.$$

Therefore:

$$f(x) = \frac{1}{2}u_0(x) - \frac{1}{2c}\int_0^x v_0(\xi) \, d\xi - \frac{K}{2}. \qquad\boldsymbol{(12)}$$

### 2.4 Final Classical Solution

Substituting (11) and (12) into (6):

$$u(x,t) = \frac{1}{2}u_0(x-ct) - \frac{1}{2c}\int_0^{x-ct} v_0(\xi) \, d\xi + \frac{1}{2}u_0(x+ct) + \frac{1}{2c}\int_0^{x+ct} v_0(\xi) \, d\xi.$$

Simplifying:

$$\boxed{u(x,t) = \frac{1}{2}[u_0(x-ct) + u_0(x+ct)] + \frac{1}{2c}\int_{x-ct}^{x+ct} v_0(\xi) \, d\xi} \qquad\boldsymbol{(13)}$$

This is **d'Alembert's formula** for the wave equation.

## 3. Method II: Fourier-Laplace Transform Solution

### 3.1 Transform Definitions and Strategy

We define:

$$\mathcal{F}_x[u(x,t)](k) \equiv \int_{-\infty}^{\infty} u(x,t)e^{-ikx} \, dx, \qquad \mathcal{L}_t[u(x,t)](s) \equiv \int_0^{\infty} u(x,t)e^{-st} \, dt. \qquad\boldsymbol{(14)}$$

The Laplace transform in time enforces causality ($t \geq 0$) and naturally incorporates initial conditions through its differentiation properties.

### 3.2 Applying Transforms

Taking the Fourier and Laplace transforms of both sides of (1), we use the identities:

$$\mathcal{F}_x[u_{xx}](k) = -k^2\mathcal{F}_x[u](k), \qquad \mathcal{L}_t[u_{tt}](s) = s^2\mathcal{L}_t[u](s) - su_0(x) - v_0(x).$$

After interchanging the order of transforms and algebraic manipulation (details in Appendix A), we obtain:

$$(s^2 + c^2k^2)\mathcal{F}_x[\mathcal{L}_t[u](s)](k) = s\mathcal{F}_x[u_0(x)](k) + \mathcal{F}_x[v_0(x)](k). \qquad\boldsymbol{(18)}$$

Solving for the double transform:

$$\mathcal{F}_x[\mathcal{L}_t[u](s)](k) = \frac{s}{s^2 + c^2k^2}\mathcal{F}_x[u_0(x)](k) + \frac{1}{s^2 + c^2k^2}\mathcal{F}_x[v_0(x)](k). \qquad\boldsymbol{(19)}$$

### 3.3 Inverse Laplace Transform

Applying the inverse Laplace transform and using standard identities:

$$\mathcal{L}_s^{-1}\left[\frac{s}{s^2 + a^2}\right](t) = \cos(at), \qquad \mathcal{L}_s^{-1}\left[\frac{1}{s^2 + a^2}\right](t) = \frac{\sin(at)}{a},$$

with $a = ck$, we obtain:

$$\mathcal{F}_x[u](k) = \cos(ckt)\mathcal{F}_x[u_0(x)](k) + \frac{\sin(ckt)}{ck}\mathcal{F}_x[v_0(x)](k). \qquad\boldsymbol{(20)}$$

**Remark:** The $k=0$ mode is handled by the limit $\lim_{k \to 0} \sin(ckt)/(ck) = t$, which is continuous.

### 3.4 Converting to Exponential Form and Inverse Transform

Using Euler's formula to convert trigonometric functions to exponentials, then applying substitutions and integration by parts (full details in Appendix A), we obtain:

$$\boxed{u(x,t) = \frac{1}{2}[u_0(x+ct) + u_0(x-ct)] + \frac{1}{2c}\int_{x-ct}^{x+ct} v_0(\xi_1) \, d\xi_1} \qquad\boldsymbol{(26)}$$

## 4. Equivalence of Solutions

Comparing equations (13) and (26), we see they are **identical**—both yield d'Alembert's formula. This demonstrates that the classical geometric method and the systematic transform approach are mathematically equivalent, each offering complementary insights:

1. The **classical method** provides geometric insight through traveling waves
2. The **transform method** provides algebraic power and extends naturally to more complex problems
3. Both approaches yield the **same physical predictions**

## 5. Physical Interpretation

The solution has a beautiful physical interpretation:

### First Term: Initial Displacement
$$\frac{1}{2}[u_0(x-ct) + u_0(x+ct)]$$

Represents the initial displacement splitting into two waves of half amplitude:
- $\frac{1}{2}u_0(x-ct)$: travels right with speed $c$
- $\frac{1}{2}u_0(x+ct)$: travels left with speed $c$

### Second Term: Initial Velocity
$$\frac{1}{2c}\int_{x-ct}^{x+ct} v_0(\xi) \, d\xi$$

Represents the contribution from initial velocity, spread over the interval $[x-ct, x+ct]$ of length $2ct$. This term integrates the velocity distribution over the "domain of influence" at point $x$ and time $t$.

## 6. Interactive Wave Simulation

The simulation below demonstrates the wave equation solution in real time. Adjust the initial conditions and watch how the wave propagates according to d'Alembert's formula!

**How to use:** Choose initial displacement and velocity profiles from the dropdown menus, adjust the wave speed, and click "Start" to see the solution evolve. The visualization shows how the initial conditions split into left- and right-traveling waves.

[codeContainer](../scripts/blog-post-scripts/wave-equation-demo.js)

## 7. Special Cases

### 7.1 Plucked String (Zero Initial Velocity)

For $v_0(x) = 0$ and a triangular displacement:

$$u_0(x) = \begin{cases} 1 - |x|/L & |x| \leq L \\ 0 & |x| > L \end{cases}$$

The solution is simply:

$$u(x,t) = \frac{1}{2}[u_0(x-ct) + u_0(x+ct)],$$

showing the initial shape splitting into two triangular waves moving in opposite directions.

### 7.2 Struck String (Zero Initial Displacement)

For $u_0(x) = 0$ and localized initial velocity $v_0(x) = V\delta(x)$ (impulse):

$$u(x,t) = \frac{V}{2c}\int_{x-ct}^{x+ct} \delta(\xi) \, d\xi = \begin{cases} V/(2c) & |x| < ct \\ 0 & |x| > ct \end{cases}$$

This creates an expanding rectangular pulse.

### 7.3 Gaussian Initial Displacement

For $u_0(x) = Ae^{-x^2/(2\sigma^2)}$ and $v_0(x) = 0$:

$$u(x,t) = \frac{A}{2}\left[e^{-(x-ct)^2/(2\sigma^2)} + e^{-(x+ct)^2/(2\sigma^2)}\right],$$

showing two Gaussian pulses separating with time.

## 8. Energy Conservation

The total energy in the wave is conserved:

$$E = \frac{1}{2}\int_{-\infty}^{\infty} \left[u_t^2 + c^2u_x^2\right] dx = \text{constant}.$$

This can be verified by differentiating d'Alembert's formula and integrating (see Appendix B for details). The transform method automatically respects this conservation law through the Parseval relation.

## 9. Comparison with Diffusion (Heat Equation)

Unlike the heat equation which exhibits:
- Infinite propagation speed
- Smoothing of discontinuities
- Irreversibility

The wave equation exhibits:
- **Finite propagation speed** $c$ (information travels at most distance $ct$)
- **Sharp propagation** (discontinuities remain discontinuous)
- **Reversibility** (time-reversal symmetry: $t \to -t$ is also a solution)
- **Energy conservation** (no dissipation)

## 10. Conclusion

The one-dimensional wave equation admits a simple, physically transparent solution: the initial shape splits into two waves traveling at $\pm c$, and initial velocity contributes via an integral over the characteristic cone. d'Alembert's method gives geometric intuition; the Fourier–Laplace approach builds an algebraic template useful for linear extensions (damping, forcing, higher dimensions). Use the demo to see these mechanisms directly: change $u_0, v_0, c$ and watch the two pulses separate.

## Appendix A: Detailed Transform Algebra

<details>
<summary>Click to expand transform derivation details</summary>

### A.1 From PDE to Algebraic Equation

Taking the Fourier and Laplace transforms of both sides of (1):

$$\mathcal{F}_x[\mathcal{L}_t[u_{tt}](s)](k) = c^2 \mathcal{L}_t[\mathcal{F}_x[u_{xx}](k)](s). \qquad\boldsymbol{(15)}$$

Applying transform identities:

$$\mathcal{F}_x[s^2\mathcal{L}_t[u](s) - su_0(x) - v_0(x)](k) = -c^2k^2\mathcal{L}_t[\mathcal{F}_x[u](k)](s). \qquad\boldsymbol{(16)}$$

Separating the left side:

$$s^2\mathcal{F}_x[\mathcal{L}_t[u](s)](k) - s\mathcal{F}_x[u_0(x)](k) - \mathcal{F}_x[v_0(x)](k) = -c^2k^2\mathcal{L}_t[\mathcal{F}_x[u](k)](s). \qquad\boldsymbol{(17)}$$

Interchanging transform order on the right and collecting terms:

$$(s^2 + c^2k^2)\mathcal{F}_x[\mathcal{L}_t[u](s)](k) = s\mathcal{F}_x[u_0(x)](k) + \mathcal{F}_x[v_0(x)](k). \qquad\boldsymbol{(18)}$$

### A.2 Converting to Exponential Form

Using Euler's formula in equation (20):

$$\cos(ckt) = \frac{e^{ickt} + e^{-ickt}}{2}, \qquad \sin(ckt) = \frac{e^{ickt} - e^{-ickt}}{2i},$$

we obtain:

$$\mathcal{F}_x[u](k) = \frac{e^{ickt} + e^{-ickt}}{2}\mathcal{F}_x[u_0(x)](k) + \frac{e^{ickt} - e^{-ickt}}{2ick}\mathcal{F}_x[v_0(x)](k). \qquad\boldsymbol{(21)}$$

Substituting the Fourier transform definition:

$$\mathcal{F}_x[u](k) = \frac{1}{2}\int_{-\infty}^{\infty} u_0(x)e^{-ik(x-ct)} \, dx + \frac{1}{2}\int_{-\infty}^{\infty} u_0(x)e^{-ik(x+ct)} \, dx$$

$$\quad + \frac{1}{2ick}\int_{-\infty}^{\infty} v_0(x)e^{-ik(x-ct)} \, dx - \frac{1}{2ick}\int_{-\infty}^{\infty} v_0(x)e^{-ik(x+ct)} \, dx. \qquad\boldsymbol{(22)}$$

### A.3 Variable Substitutions and Integration by Parts

Making substitutions $\xi = x - ct$ for the first and third integrals, $\xi = x + ct$ for the second and fourth:

$$\mathcal{F}_x[u](k) = \frac{1}{2}\int_{-\infty}^{\infty} u_0(\xi + ct)e^{-ik\xi} \, d\xi + \frac{1}{2}\int_{-\infty}^{\infty} u_0(\xi - ct)e^{-ik\xi} \, d\xi$$

$$\quad + \frac{1}{2ick}\int_{-\infty}^{\infty} v_0(\xi + ct)e^{-ik\xi} \, d\xi - \frac{1}{2ick}\int_{-\infty}^{\infty} v_0(\xi - ct)e^{-ik\xi} \, d\xi. \qquad\boldsymbol{(23)}$$

For the third and fourth integrals, we integrate by parts. Let:

$$f_1(\xi) = v_0(\xi + ct), \quad df_1 = v_0'(\xi+ct)d\xi$$
$$g_2(\xi) = e^{-ik\xi}, \quad dg_2 = -ike^{-ik\xi}d\xi$$

Integrating by parts (boundary terms vanish due to decay):

$$\int_{-\infty}^{\infty} v_0(\xi + ct)e^{-ik\xi} \, d\xi = \left[\frac{v_0(\xi+ct)e^{-ik\xi}}{-ik}\right]_{-\infty}^{\infty} - \int_{-\infty}^{\infty} \frac{v_0'(\xi+ct)e^{-ik\xi}}{-ik}\, d\xi$$

$$= -\frac{1}{ik}\int_{-\infty}^{\infty} v_0'(\xi+ct)e^{-ik\xi}\, d\xi$$

Recognizing that $v_0'(\xi+ct) = \frac{d}{d\xi}\int_{-\infty}^{\xi} v_0(x_1+ct)\,dx_1$, and continuing with further substitutions $x_1 = \xi_1 - ct$, we arrive at:

$$\mathcal{F}_x[u](k) = \frac{1}{2}\int_{-\infty}^{\infty} u_0(\xi + ct)e^{-ik\xi} \, d\xi + \frac{1}{2}\int_{-\infty}^{\infty} u_0(\xi - ct)e^{-ik\xi} \, d\xi$$

$$\quad + \frac{1}{2c}\int_{-\infty}^{\infty} \left(\int_{\xi-ct}^{\xi+ct} v_0(\xi_1) \, d\xi_1\right) e^{-ik\xi} \, d\xi. \qquad\boldsymbol{(25)}$$

### A.4 Inverse Fourier Transform

Applying the inverse Fourier transform to equation (25) yields:

$$u(x,t) = \frac{1}{2}[u_0(x + ct) + u_0(x - ct)] + \frac{1}{2c}\int_{x-ct}^{x+ct} v_0(\xi_1) \, d\xi_1. \qquad\boldsymbol{(26)}$$

</details>

## Appendix B: Energy Conservation Derivation

<details>
<summary>Click to expand energy conservation proof</summary>

From d'Alembert's formula:

$$u(x,t) = \frac{1}{2}[u_0(x-ct) + u_0(x+ct)] + \frac{1}{2c}\int_{x-ct}^{x+ct} v_0(\xi) \, d\xi$$

Computing derivatives:

$$u_t = \frac{c}{2}[-u_0'(x-ct) + u_0'(x+ct)] + \frac{1}{2}[v_0(x+ct) + v_0(x-ct)]$$

$$u_x = \frac{1}{2}[u_0'(x-ct) + u_0'(x+ct)] + \frac{1}{2c}[v_0(x+ct) - v_0(x-ct)]$$

The total energy is:

$$E(t) = \frac{1}{2}\int_{-\infty}^{\infty} [u_t^2 + c^2u_x^2] \, dx$$

After substitution and simplification (using orthogonality of traveling waves):

$$E(t) = \frac{1}{2}\int_{-\infty}^{\infty} [v_0^2(\xi) + c^2u_0'^2(\xi)] \, d\xi = E(0) = \text{constant}$$

</details>

## References

1. Strauss, W. A. (2007). *Partial Differential Equations: An Introduction* (2nd ed.). Wiley. Chapter 1: The Wave Equation.

2. Evans, L. C. (2010). *Partial Differential Equations* (2nd ed.). American Mathematical Society. Chapter 2.4: Hyperbolic Equations.

3. Haberman, R. (2012). *Applied Partial Differential Equations with Fourier Series and Boundary Value Problems* (5th ed.). Pearson. Chapter 12: The Wave Equation.

4. Folland, G. B. (1995). *Introduction to Partial Differential Equations* (2nd ed.). Princeton University Press.

5. Whitham, G. B. (1999). *Linear and Nonlinear Waves*. Wiley-Interscience.

---

*Questions or corrections? Email me at adfield@wpi.edu*
---
title: "Orthogonal Polynomials: From Theory to Your Name"
date: "2025-11-15"
tags: "Mathematics, Special Functions"
snippet: "A systematic derivation of orthogonal polynomials and their completeness, with an interactive tool to approximate your name using a complete set."
---

# Orthogonal Polynomials: From Theory to Your Name

## Introduction

Following our study of special functions, asymptotic series, and Stirling's formula (Boas Chapter 11), we now explore one of the most powerful tools in mathematical physics: **orthogonal polynomials**. These functions form complete sets that can represent *any* reasonable function—including, as we'll see, your name written as a mathematical object.

This discussion follows the methodology of Boas's *Mathematical Methods in the Physical Sciences* (3rd Edition), Chapter 12.

## 1. Inner Products and Orthogonality

### 1.1 The Inner Product

Following Boas (Section 12.1), we begin by defining an **inner product** for functions. For two functions $f(x)$ and $g(x)$ on an interval $[a, b]$ with weight function $w(x) > 0$, we define:

$$\langle f, g \rangle = \int_a^b f(x) g(x) w(x) \, dx$$

This is the continuous analog of the dot product for vectors. The weight function $w(x)$ allows us to emphasize different regions of the domain.

### 1.2 Orthogonality

Two functions $f$ and $g$ are **orthogonal** with respect to weight $w(x)$ if:

$$\langle f, g \rangle = 0$$

A set of functions $\{\phi_n(x)\}_{n=0}^{\infty}$ is **orthogonal** if:

$$\langle \phi_n, \phi_m \rangle = 0 \quad \text{for all } n \neq m$$

If additionally $\langle \phi_n, \phi_n \rangle = 1$ for all $n$, the set is **orthonormal**.

### 1.3 Normalization

For an orthogonal set, we can normalize each function:

$$\tilde{\phi}_n(x) = \frac{\phi_n(x)}{\sqrt{\langle \phi_n, \phi_n \rangle}}$$

The normalization constant involves integrals often expressible in terms of the Gamma function we studied in Chapter 11.

## 2. The Legendre Polynomials

### 2.1 Definition

The **Legendre polynomials** $P_n(x)$ are orthogonal on $[-1, 1]$ with weight function $w(x) = 1$. Following Boas (Section 12.2), they can be defined by **Rodrigues' formula**:

$$P_n(x) = \frac{1}{2^n n!} \frac{d^n}{dx^n} \left[(x^2 - 1)^n\right]$$

The first few polynomials are:
- $P_0(x) = 1$
- $P_1(x) = x$
- $P_2(x) = \frac{1}{2}(3x^2 - 1)$
- $P_3(x) = \frac{1}{2}(5x^3 - 3x)$
- $P_4(x) = \frac{1}{8}(35x^4 - 30x^2 + 3)$

### 2.2 Orthogonality Relation

The Legendre polynomials satisfy (Boas, Section 12.3):

$$\int_{-1}^{1} P_n(x) P_m(x) \, dx = \begin{cases} 
0 & \text{if } n \neq m \\
\frac{2}{2n+1} & \text{if } n = m
\end{cases}$$

This orthogonality is fundamental to their use as a basis.

### 2.3 Recurrence Relations

The Legendre polynomials satisfy the three-term recurrence relation (Boas, Equation 12.15):

$$(n+1)P_{n+1}(x) = (2n+1)xP_n(x) - nP_{n-1}(x)$$

This allows efficient computation of high-degree polynomials.

## 3. Completeness and Function Expansion

### 3.1 The Completeness Theorem

The key result (Boas, Section 12.4) is that orthogonal polynomials form a **complete set**: any piecewise continuous function $f(x)$ on $[a, b]$ can be represented as:

$$f(x) = \sum_{n=0}^{\infty} a_n \phi_n(x)$$

where the series converges in the mean-square sense:

$$\lim_{N \to \infty} \int_a^b \left[f(x) - \sum_{n=0}^N a_n \phi_n(x)\right]^2 w(x) \, dx = 0$$

### 3.2 Computing the Coefficients

For an orthogonal set, the coefficients are found by exploiting orthogonality. Multiply both sides by $\phi_m(x) w(x)$ and integrate:

$$\int_a^b f(x) \phi_m(x) w(x) \, dx = \sum_{n=0}^{\infty} a_n \int_a^b \phi_n(x) \phi_m(x) w(x) \, dx$$

By orthogonality, only the $n = m$ term survives:

$$\langle f, \phi_m \rangle = a_m \langle \phi_m, \phi_m \rangle$$

Therefore:

$$a_n = \frac{\langle f, \phi_n \rangle}{\langle \phi_n, \phi_n \rangle} = \frac{\int_a^b f(x) \phi_n(x) w(x) \, dx}{\int_a^b \phi_n^2(x) w(x) \, dx}$$

This is the **Fourier-Legendre coefficient** for Legendre polynomials (Boas, Section 12.4).

### 3.3 Partial Sums and Convergence

The partial sum:

$$S_N(x) = \sum_{n=0}^{N} a_n \phi_n(x)$$

is the **best approximation** to $f(x)$ in the least-squares sense using polynomials up to degree $N$. As $N \to \infty$, we have $S_N(x) \to f(x)$ in the mean-square sense.

### 3.4 Properties of the Expansion

Following Boas (Section 12.5):

1. **Best approximation**: The partial sum $S_N(x)$ minimizes the integral:
   $$\int_a^b [f(x) - p_N(x)]^2 w(x) \, dx$$
   over all polynomials $p_N(x)$ of degree at most $N$.

2. **Parseval's relation**: For a complete orthonormal set:
   $$\int_a^b |f(x)|^2 w(x) \, dx = \sum_{n=0}^{\infty} |a_n|^2$$

3. **Gibbs phenomenon**: At discontinuities, the series may exhibit overshoot, analogous to Fourier series.

## 4. Two-Dimensional Extensions

To represent images or text, we extend to two dimensions using **tensor products**. Following the same methodology:

$$f(x, y) = \sum_{m=0}^{\infty} \sum_{n=0}^{\infty} a_{mn} \phi_m(x) \psi_n(y)$$

For separable bases like Legendre polynomials:

$$\phi_m(x) \psi_n(y) = P_m(x) P_n(y)$$

The coefficients are:

$$a_{mn} = \frac{\int_{-1}^{1} \int_{-1}^{1} f(x,y) P_m(x) P_n(y) \, dx \, dy}{\int_{-1}^{1} P_m^2(x) \, dx \int_{-1}^{1} P_n^2(y) \, dy}$$

Using the normalization $\int_{-1}^{1} P_n^2(x) \, dx = \frac{2}{2n+1}$:

$$a_{mn} = \frac{(2m+1)(2n+1)}{4} \int_{-1}^{1} \int_{-1}^{1} f(x,y) P_m(x) P_n(y) \, dx \, dy$$

## 5. Interactive Demonstration: Your Name in Orthogonal Polynomials

Now we put theory into practice. The simulation below:

1. Takes your name as input
2. Renders it as a function $f(x, y)$ on $[-1, 1] \times [-1, 1]$
3. Projects it onto the Legendre polynomial basis
4. Reconstructs the image using partial sums up to degree $N$
5. Displays your personal complete set of coefficients

This demonstrates that orthogonal polynomials truly form a complete set—capable of representing even arbitrary text!

[codeContainer](../scripts/blog-post-scripts/orthogonal-name.js)

## 6. Physical Applications

Orthogonal polynomials appear throughout physics (Boas, Chapter 12):

### 6.1 Legendre Polynomials
- **Electrostatics**: Multipole expansions of potentials
- **Quantum mechanics**: Angular momentum eigenstates
- **Scattering theory**: Partial wave expansions

### 6.2 Hermite Polynomials
- **Quantum harmonic oscillator**: Energy eigenfunctions
- **Probability theory**: Edgeworth expansions
- **Signal processing**: Hermite-Gaussian beams

They arise naturally because they are eigenfunctions of Sturm-Liouville differential equations.

### 6.3 Laguerre Polynomials
- **Hydrogen atom**: Radial wave functions
- **Quantum field theory**: Coherent states

## 7. Connection to Previous Material

This material connects deeply to our earlier studies:

### 7.1 Gamma and Beta Functions (Chapter 11)
The normalization integrals for orthogonal polynomials often involve:

$$\int_0^{\infty} x^n e^{-x} \, dx = n! = \Gamma(n+1)$$

For Hermite polynomials with weight $w(x) = e^{-x^2}$:

$$\int_{-\infty}^{\infty} H_n^2(x) e^{-x^2} \, dx = 2^n n! \sqrt{\pi}$$

The $\sqrt{\pi}$ factor comes from the Gaussian integral $\Gamma(1/2) = \sqrt{\pi}$.

### 7.2 Asymptotic Series (Chapter 11)
For large $n$, Stirling's formula gives the asymptotic behavior:

$$n! \sim \sqrt{2\pi n} \left(\frac{n}{e}\right)^n$$

This allows us to estimate the normalization for high-degree polynomials and understand convergence rates.

### 7.3 Error Function
The error function $\text{erf}(x)$ with weight $e^{-x^2}$ led us to Hermite polynomials, which are orthogonal with respect to that same Gaussian weight.

## 8. Computational Considerations

When implementing these expansions numerically:

### 8.1 Discrete vs Continuous
We approximate the continuous integral:

$$a_n = \frac{2n+1}{2} \int_{-1}^{1} f(x) P_n(x) \, dx$$

with a discrete sum:

$$a_n \approx \frac{2n+1}{2} \cdot \frac{2}{M} \sum_{i=1}^{M} f(x_i) P_n(x_i)$$

where $x_i$ are uniformly spaced points in $[-1, 1]$.

### 8.2 Stability
The three-term recurrence relation is numerically stable for computing Legendre polynomials:

$$P_{n+1}(x) = \frac{(2n+1)xP_n(x) - nP_{n-1}(x)}{n+1}$$

starting from $P_0(x) = 1$ and $P_1(x) = x$.

### 8.3 Truncation Error
The approximation error using $N$ terms satisfies:

$$E_N = \int_{-1}^{1} \left[f(x) - \sum_{n=0}^{N} a_n P_n(x)\right]^2 dx = \sum_{n=N+1}^{\infty} a_n^2 \frac{2}{2n+1}$$

This decreases as $N$ increases, demonstrating convergence.

## 9. Conclusion

We have shown that orthogonal polynomials:

1. Form a complete orthogonal basis on their domain
2. Allow any function to be expanded as a series
3. Provide the best polynomial approximation in the least-squares sense
4. Connect deeply to special functions through normalization
5. Arise naturally in physical problems

The interactive demonstration shows this isn't just abstract mathematics—these functions can literally reconstruct arbitrary patterns, including your name! Each coefficient $a_{mn}$ in your complete set represents how much of that particular polynomial "mode" is needed to build your unique pattern.

As Boas emphasizes throughout Chapter 12, orthogonal polynomials are not merely mathematical curiosities but essential tools for solving differential equations, evaluating integrals, and approximating functions in physics and engineering.

## References

1. Boas, M. L. (2006). *Mathematical Methods in the Physical Sciences* (3rd ed.). Wiley. Chapter 12: Orthogonal Polynomials and Special Functions.
2. Arfken, G. B., Weber, H. J., & Harris, F. E. (2013). *Mathematical Methods for Physicists* (7th ed.). Academic Press.
3. Jackson, J. D. (1999). *Classical Electrodynamics* (3rd ed.). Wiley. Chapter 3: Multipole Expansion.
4. Szegö, G. (1939). *Orthogonal Polynomials*. American Mathematical Society.

---

*Thank you Professor Zozulya for the idea to make this code!*
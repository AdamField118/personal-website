---
title: "Deriving the Lorentz Force from First Principles"
date: "2025-11-25"
tags: "Classical Mechanics, Electromagnetism"
snippet: "A complete derivation of F = q(E + v×B) using Lagrangian and Hamiltonian mechanics, showing how electromagnetic forces emerge from minimal coupling to gauge potentials."
---

# Deriving the Lorentz Force from First Principles

## Introduction

The Lorentz force law, $\boldsymbol{F} = q(\boldsymbol{E} + \boldsymbol{v} \times \boldsymbol{B})$, describes how charged particles interact with electromagnetic fields. While often presented as a fundamental postulate, it can be derived systematically from the principle of stationary action using the Lagrangian formulation of classical mechanics.

This derivation demonstrates one of the most beautiful aspects of theoretical physics: the deep connection between geometry (gauge potentials), symmetry (gauge invariance), and dynamics (equations of motion).

## 1. Setting Up the Problem

Consider a particle with:
- Mass: $m$
- Charge: $q$
- Position: $\boldsymbol{r}(t)$
- Velocity: $\boldsymbol{v}(t) = \boldsymbol{\dot{r}}(t)$

The electromagnetic field is described by two potentials:
- **Scalar potential**: $\phi(\boldsymbol{r}, t)$
- **Vector potential**: $\boldsymbol{A}(\boldsymbol{r}, t)$

These potentials are related to the physical fields by:

$$\boldsymbol{E} = -\nabla\phi - \frac{\partial \boldsymbol{A}}{\partial t}$$

$$\boldsymbol{B} = \nabla \times \boldsymbol{A}$$

## 2. The Lagrangian

### 2.1 Motivating the Form

We seek a Lagrangian $L(\boldsymbol{r}, \boldsymbol{v}, t)$ that:
1. Reduces to the free particle when fields vanish: $L_0 = \frac{1}{2}mv^2$
2. Is gauge invariant (physics unchanged under $\phi \to \phi - \frac{\partial\chi}{\partial t}$, $\boldsymbol{A} \to \boldsymbol{A} + \nabla\chi$)
3. Produces the correct equations of motion

The scalar potential $\phi$ represents potential energy per unit charge, so we include $-q\phi$.

The key insight is that magnetic forces are velocity-dependent. The simplest Lorentz-scalar coupling linear in velocity is $\boldsymbol{v} \cdot \boldsymbol{A}$.

### 2.2 The Lagrangian of a Charged Particle

$$\boxed{L = \frac{1}{2}mv^2 - q\phi + q\boldsymbol{v} \cdot \boldsymbol{A}}$$

This is called **minimal coupling** to the electromagnetic field.

## 3. Canonical Momentum

The canonical momentum is defined by:

$$\boldsymbol{p} = \frac{\partial L}{\partial \boldsymbol{v}}$$

Computing this:

$$\boldsymbol{p} = \frac{\partial}{\partial \boldsymbol{v}}\left[\frac{1}{2}mv^2 - q\phi + q\boldsymbol{v} \cdot \boldsymbol{A}\right]$$

Since $\boldsymbol{A}$ depends on position and time but not velocity:

$$\boxed{\boldsymbol{p} = m\boldsymbol{v} + q\boldsymbol{A}}$$

**Key observation**: The canonical momentum differs from the mechanical momentum $m\boldsymbol{v}$ by the electromagnetic contribution $q\boldsymbol{A}$.

## 4. Legendre Transform to the Hamiltonian

### 4.1 Expressing Velocity in Terms of Canonical Momentum

From $\boldsymbol{p} = m\boldsymbol{v} + q\boldsymbol{A}$:

$$\boldsymbol{v} = \frac{\boldsymbol{p} - q\boldsymbol{A}}{m}$$

### 4.2 The Legendre Transform

The Hamiltonian is defined by:

$$H = \boldsymbol{p} \cdot \boldsymbol{v} - L$$

Substituting the Lagrangian:

$$H = \boldsymbol{p} \cdot \boldsymbol{v} - \left(\frac{1}{2}m\boldsymbol{v}^2 - q\phi + q\boldsymbol{v} \cdot \boldsymbol{A}\right)$$

$$H = \boldsymbol{p} \cdot \boldsymbol{v} - \frac{1}{2}m\boldsymbol{v}^2 + q\phi - q\boldsymbol{v} \cdot \boldsymbol{A}$$

### 4.3 Substituting the Expression for Velocity

Now substitute $\boldsymbol{v} = \frac{\boldsymbol{p} - q\boldsymbol{A}}{m}$:

$$H = \boldsymbol{p} \cdot \frac{\boldsymbol{p} - q\boldsymbol{A}}{m} - \frac{1}{2}m\left(\frac{\boldsymbol{p} - q\boldsymbol{A}}{m}\right)^2 + q\phi - q\frac{\boldsymbol{p} - q\boldsymbol{A}}{m} \cdot \boldsymbol{A}$$

Expanding each term:

**First term**:
$$\frac{\boldsymbol{p}^2 - q\boldsymbol{p} \cdot \boldsymbol{A}}{m}$$

**Second term**:
$$-\frac{(\boldsymbol{p} - q\boldsymbol{A})^2}{2m} = -\frac{\boldsymbol{p}^2 - 2q\boldsymbol{p} \cdot \boldsymbol{A} + q^2\boldsymbol{A}^2}{2m}$$

**Fourth term**:
$$-\frac{q\boldsymbol{p} \cdot \boldsymbol{A} - q^2\boldsymbol{A}^2}{m}$$

Combining:

$$H = \frac{\boldsymbol{p}^2}{m} - \frac{q\boldsymbol{p} \cdot \boldsymbol{A}}{m} - \frac{\boldsymbol{p}^2}{2m} + \frac{q\boldsymbol{p} \cdot \boldsymbol{A}}{m} - \frac{q^2\boldsymbol{A}^2}{2m} + q\phi - \frac{q\boldsymbol{p} \cdot \boldsymbol{A}}{m} + \frac{q^2\boldsymbol{A}^2}{m}$$

Collecting like terms:

$$H = \frac{\boldsymbol{p}^2}{2m} - \frac{q\boldsymbol{p} \cdot \boldsymbol{A}}{m} + \frac{q^2\boldsymbol{A}^2}{2m} + q\phi$$

This factors beautifully:

$$\boxed{H = \frac{(\boldsymbol{p} - q\boldsymbol{A})^2}{2m} + q\phi}$$

## 5. Hamilton's Equations

Hamilton's equations in terms of canonical variables $(\boldsymbol{r}, \boldsymbol{p})$ are:

$$\boldsymbol{\dot{r}} = \frac{\partial H}{\partial \boldsymbol{p}}, \quad \boldsymbol{\dot{p}} = -\frac{\partial H}{\partial \boldsymbol{r}}$$

### 5.1 First Hamilton Equation (Position Evolution)

$$\boldsymbol{\dot{r}} = \frac{\partial H}{\partial \boldsymbol{p}} = \frac{\partial}{\partial \boldsymbol{p}}\left[\frac{(\boldsymbol{p} - q\boldsymbol{A})^2}{2m}\right] = \frac{\boldsymbol{p} - q\boldsymbol{A}}{m}$$

This confirms:

$$\boxed{\boldsymbol{v} = \frac{\boldsymbol{p} - q\boldsymbol{A}}{m}}$$

The velocity equals the kinetic momentum $\boldsymbol{\pi} = \boldsymbol{p} - q\boldsymbol{A}$ divided by mass.

### 5.2 Second Hamilton Equation (Momentum Evolution)

$$\boldsymbol{\dot{p}} = -\frac{\partial H}{\partial \boldsymbol{r}}$$

Computing the spatial derivative:

$$\frac{\partial H}{\partial \boldsymbol{r}} = \frac{1}{2m}\frac{\partial}{\partial \boldsymbol{r}}(\boldsymbol{p} - q\boldsymbol{A})^2 + q\frac{\partial \phi}{\partial \boldsymbol{r}}$$

Since $\boldsymbol{p}$ is independent of position:

$$\frac{\partial H}{\partial \boldsymbol{r}} = \frac{1}{2m} \cdot 2(\boldsymbol{p} - q\boldsymbol{A}) \cdot \left(-q\frac{\partial \boldsymbol{A}}{\partial \boldsymbol{r}}\right) + q\nabla\phi$$

$$= -\frac{q}{m}(\boldsymbol{p} - q\boldsymbol{A}) \cdot \nabla\boldsymbol{A} + q\nabla\phi$$

Using $\boldsymbol{p} - q\boldsymbol{A} = m\boldsymbol{v}$:

$$= -q\boldsymbol{v} \cdot \nabla\boldsymbol{A} + q\nabla\phi$$

In component form, this is $-q\nabla(\boldsymbol{v} \cdot \boldsymbol{A}) + q\nabla\phi$.

Therefore:

$$\boxed{\boldsymbol{\dot{p}} = q\nabla(\boldsymbol{v} \cdot \boldsymbol{A}) - q\nabla\phi}$$

## 6. Deriving Newton's Second Law

### 6.1 Time Derivative of Canonical Momentum

From $\boldsymbol{p} = m\boldsymbol{v} + q\boldsymbol{A}$, taking the total time derivative:

$$\boldsymbol{\dot{p}} = m\boldsymbol{\dot{v}} + q\frac{d\boldsymbol{A}}{dt}$$

where the total derivative is:

$$\frac{d\boldsymbol{A}}{dt} = \frac{\partial \boldsymbol{A}}{\partial t} + (\boldsymbol{v} \cdot \nabla)\boldsymbol{A}$$

Therefore:

$$\boxed{\boldsymbol{\dot{p}} = m\boldsymbol{\dot{v}} + q\frac{\partial \boldsymbol{A}}{\partial t} + q(\boldsymbol{v} \cdot \nabla)\boldsymbol{A}}$$

### 6.2 Using the Vector Identity

The key vector identity is:

$$\nabla(\boldsymbol{v} \cdot \boldsymbol{A}) = (\boldsymbol{v} \cdot \nabla)\boldsymbol{A} + \boldsymbol{v} \times (\nabla \times \boldsymbol{A})$$

Since $\boldsymbol{B} = \nabla \times \boldsymbol{A}$:

$$\nabla(\boldsymbol{v} \cdot \boldsymbol{A}) = (\boldsymbol{v} \cdot \nabla)\boldsymbol{A} + \boldsymbol{v} \times \boldsymbol{B}$$

### 6.3 Combining the Results

From Hamilton's equation:
$$\boldsymbol{\dot{p}} = q\nabla(\boldsymbol{v} \cdot \boldsymbol{A}) - q\nabla\phi$$

Substituting the vector identity:
$$\boldsymbol{\dot{p}} = q(\boldsymbol{v} \cdot \nabla)\boldsymbol{A} + q\boldsymbol{v} \times \boldsymbol{B} - q\nabla\phi$$

From the time derivative:
$$\boldsymbol{\dot{p}} = m\boldsymbol{\dot{v}} + q\frac{\partial \boldsymbol{A}}{\partial t} + q(\boldsymbol{v} \cdot \nabla)\boldsymbol{A}$$

Equating these two expressions:

$$m\boldsymbol{\dot{v}} + q\frac{\partial \boldsymbol{A}}{\partial t} + q(\boldsymbol{v} \cdot \nabla)\boldsymbol{A} = q(\boldsymbol{v} \cdot \nabla)\boldsymbol{A} + q\boldsymbol{v} \times \boldsymbol{B} - q\nabla\phi$$

The $q(\boldsymbol{v} \cdot \nabla)\boldsymbol{A}$ terms cancel:

$$m\boldsymbol{\dot{v}} + q\frac{\partial \boldsymbol{A}}{\partial t} = q\boldsymbol{v} \times \boldsymbol{B} - q\nabla\phi$$

Rearranging:

$$m\boldsymbol{\dot{v}} = -q\nabla\phi - q\frac{\partial \boldsymbol{A}}{\partial t} + q\boldsymbol{v} \times \boldsymbol{B}$$

Recognizing the electric field $\boldsymbol{E} = -\nabla\phi - \frac{\partial \boldsymbol{A}}{\partial t}$:

$$\boxed{m\boldsymbol{\dot{v}} = q\boldsymbol{E} + q\boldsymbol{v} \times \boldsymbol{B}}$$

## 7. The Lorentz Force Law

The force on the charged particle is:

$$\boxed{\boldsymbol{F} = q(\boldsymbol{E} + \boldsymbol{v} \times \boldsymbol{B})}$$

This is the **Lorentz force law**, derived completely from the Lagrangian formulation with minimal coupling to electromagnetic potentials.

## 8. Physical Interpretation

### 8.1 Two Types of Momentum

- **Canonical momentum**: $\boldsymbol{p} = m\boldsymbol{v} + q\boldsymbol{A}$ (conserved when translational symmetry exists)
- **Kinetic momentum**: $\boldsymbol{\pi} = m\boldsymbol{v} = \boldsymbol{p} - q\boldsymbol{A}$ (what we directly measure)

### 8.2 Force and Momentum

Newton's second law applies to kinetic momentum:

$$\boldsymbol{F} = \frac{d\boldsymbol{\pi}}{dt} = \frac{d(m\boldsymbol{v})}{dt} = m\boldsymbol{a}$$

The canonical momentum changes due to both force and field variation:

$$\boldsymbol{\dot{p}} = \boldsymbol{F} + q\frac{d\boldsymbol{A}}{dt}$$

### 8.3 Gauge Invariance

Under a gauge transformation $\chi(\boldsymbol{r}, t)$:

$$\phi' = \phi - \frac{\partial\chi}{\partial t}, \quad \boldsymbol{A}' = \boldsymbol{A} + \nabla\chi$$

The canonical momentum transforms as $\boldsymbol{p}' = \boldsymbol{p} + q\nabla\chi$, but the kinetic momentum $\boldsymbol{\pi} = m\boldsymbol{v}$ and the physical fields $\boldsymbol{E}$, $\boldsymbol{B}$ remain unchanged. The Lorentz force is therefore gauge invariant.

## 9. Conclusion

We have derived the Lorentz force from first principles through:

1. **Postulating** a Lagrangian with minimal coupling: $L = \frac{1}{2}mv^2 - q\phi + q\boldsymbol{v} \cdot \boldsymbol{A}$
2. **Computing** the canonical momentum: $\boldsymbol{p} = m\boldsymbol{v} + q\boldsymbol{A}$
3. **Transforming** to the Hamiltonian: $H = \frac{(\boldsymbol{p} - q\boldsymbol{A})^2}{2m} + q\phi$
4. **Applying** Hamilton's equations with careful vector calculus
5. **Obtaining** Newton's second law with the Lorentz force

This derivation reveals the deep geometric structure underlying electromagnetism: the vector potential $\boldsymbol{A}$ naturally couples to velocity through the Lagrangian, and the resulting dynamics automatically produce both electric and magnetic forces.

The fact that such a simple, elegant Lagrangian reproduces all of classical electrodynamics for charged particles is one of the great triumphs of analytical mechanics.

## References

1. Goldstein, H., Poole, C., & Safko, J. (2002). *Classical Mechanics* (3rd ed.). Addison-Wesley. Chapter 1 (Lagrangian mechanics) and Chapter 8 (Hamilton's equations).

2. Landau, L. D., & Lifshitz, E. M. (1976). *Mechanics* (3rd ed.). Butterworth-Heinemann. Section 16 (Lagrangian for a particle in an electromagnetic field).

3. Jackson, J. D. (1999). *Classical Electrodynamics* (3rd ed.). Wiley. Chapter 12 (Dynamics of relativistic particles and electromagnetic fields).

4. Griffiths, D. J. (2017). *Introduction to Electrodynamics* (4th ed.). Cambridge University Press. Section 10.1.3 (Electromagnetic field tensor and Lorentz force).

5. Arnold, V. I. (1989). *Mathematical Methods of Classical Mechanics* (2nd ed.). Springer. Chapter 8 (Variational principles).

---

*Questions or corrections? Email me at adfield@wpi.edu*
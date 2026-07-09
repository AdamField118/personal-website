#!/usr/bin/env python3
"""
Generates pages/simulations/{slug}.html for each simulation and simulations.json
(the source for the cards on /pages/sims.html).

Simulations flagged 'custom_page' (e.g. the full-screen relativistic-aberration
WebGL sim) are listed in simulations.json but keep their hand-written page.

The unified sitemap/feed/robots are written by build_blogs.py, which reads
simulations.json — run build_sims.py *before* build_blogs.py (scripts/build.py
runs the whole pipeline in order). Nav/footer come from layout.py.

Run: python3 scripts/build_sims.py
"""

import os
import re
import json

import layout  # shared nav/footer (scripts/ is on sys.path when run as a script)

ROOT    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, 'pages', 'simulations')

SITE_URL = layout.SITE_URL

os.makedirs(OUT_DIR, exist_ok=True)


def html_escape(s):
    return (s.replace('&', '&amp;').replace('<', '&lt;')
             .replace('>', '&gt;').replace('"', '&quot;'))

# Each simulation: metadata for the cards plus a short physics explainer
# ('physics' = paragraphs, 'try' = suggestions) rendered under the canvas.
SIMULATIONS = [
    {
        'script': 'black_hole', 'title': 'Black Hole Gravitational Lensing', 'topic': 'astro',
        'image': '/images/black_hole.jpg',
        'description': 'Explore Schwarzschild spacetime with real-time ray tracing and accretion disk physics.',
        'physics': [
            'Light passing near a black hole no longer travels in straight lines: it follows null '
            'geodesics of the Schwarzschild metric. Rays that pass close to the photon sphere at '
            '<em>r</em> = 3<em>GM</em>/<em>c</em><sup>2</sup> can be bent by large angles or even '
            'orbit the black hole before escaping, which is what produces the bright photon ring '
            'and the characteristic double image of the accretion disk.',
            'The critical impact parameter is <em>b</em> = 3&radic;3&thinsp;<em>GM</em>/<em>c</em><sup>2</sup>: '
            'rays aimed inside it are captured, rays outside it are deflected. This is the same physics '
            '(in the strong-field limit) as the weak gravitational lensing used to map dark matter.',
        ],
        'try': [
            'Watch how the far side of the accretion disk appears bent above and below the shadow — '
            'that light is passing over and under the black hole.',
            'Look for the thin photon ring just outside the shadow edge.',
        ],
    },
    {
        'script': 'Reflection_Refraction', 'title': 'Reflection and Refraction', 'topic': 'ocw',
        'image': '/images/reflrefr.jpg',
        'description': "Snell's law in action: change the incident angle and watch light reflect and refract at an interface.",
        'physics': [
            'At an interface between two media, part of a light ray reflects (angle of reflection equals '
            'angle of incidence) and part refracts according to Snell’s law: '
            '<em>n</em><sub>1</sub>&thinsp;sin&thinsp;<em>&theta;</em><sub>1</sub> = '
            '<em>n</em><sub>2</sub>&thinsp;sin&thinsp;<em>&theta;</em><sub>2</sub>.',
            'When light travels from a denser to a less dense medium, there is a critical angle '
            '<em>&theta;</em><sub>c</sub> = arcsin(<em>n</em><sub>2</sub>/<em>n</em><sub>1</sub>) beyond '
            'which no refracted ray exists and the light is totally internally reflected — the principle '
            'behind optical fibres.',
        ],
        'try': [
            'Increase the incident angle slowly and find the critical angle where the refracted ray vanishes.',
            'Compare how much the ray bends entering a denser medium versus leaving it.',
        ],
    },
    {
        'script': 'newtons_first_law', 'title': "Newton's First Law", 'topic': 'mechanics',
        'image': '/images/newtons_first.jpg',
        'description': 'Law of Inertia — objects remain at rest or in uniform motion unless acted upon by a force.',
        'physics': [
            'An object keeps a constant velocity unless a net external force acts on it. Everyday objects '
            'appear to “naturally” slow down only because friction and drag are forces too.',
            'In this simulation you can remove or vary those forces and see that with zero net force the '
            'motion really is unchanging — Galileo’s insight that Newton made the foundation of mechanics.',
        ],
        'try': [
            'Set friction to zero, give the object a push, and watch it coast forever.',
            'Balance two applied forces and confirm the object behaves exactly as if there were no force at all.',
        ],
    },
    {
        'script': 'newtons_second_law', 'title': "Newton's Second Law", 'topic': 'mechanics',
        'image': '/images/newtons_second.jpg',
        'description': 'Force equals mass times acceleration. Visualize how force, mass, and acceleration relate.',
        'physics': [
            'The net force on an object determines its acceleration: <strong><em>F</em> = <em>m</em><em>a</em></strong>. '
            'Doubling the force doubles the acceleration; doubling the mass halves it.',
            'Note that force controls the <em>change</em> in velocity, not the velocity itself — a constant '
            'force produces steadily increasing speed, not constant speed.',
        ],
        'try': [
            'Apply the same force to different masses and compare the accelerations.',
            'Watch the velocity keep growing while the force (and thus acceleration) stays constant.',
        ],
    },
    {
        'script': 'newtons_third_law', 'title': "Newton's Third Law", 'topic': 'mechanics',
        'image': '/images/newtons_third.jpg',
        'description': 'For every action there is an equal and opposite reaction.',
        'physics': [
            'Forces always come in pairs: if object A pushes on object B with force <em>F</em>, then B '
            'pushes back on A with force &minus;<em>F</em>. The two forces act on <em>different</em> objects, '
            'which is why they don’t cancel.',
            'A direct consequence is conservation of momentum: the momentum gained by one object is exactly '
            'the momentum lost by the other.',
        ],
        'try': [
            'Compare the recoil of a light object pushing off a heavy one — equal forces, very different accelerations.',
            'Add up the two momenta before and after the interaction and check the total is unchanged.',
        ],
    },
    {
        'script': 'momentum_collisions', 'title': 'Momentum and Collisions', 'topic': 'mechanics',
        'image': '/images/momentum_collision.jpg',
        'description': 'Explore elastic and inelastic collisions. See momentum conservation in action.',
        'physics': [
            'In any collision the total momentum <em>p</em> = <em>m</em><em>v</em> is conserved. '
            'Kinetic energy is a different story: it is conserved only in <em>elastic</em> collisions, '
            'while <em>inelastic</em> collisions convert some of it into heat and deformation.',
            'In a perfectly inelastic collision the objects stick together and move with the '
            'centre-of-mass velocity — the maximum possible kinetic-energy loss consistent with '
            'momentum conservation.',
        ],
        'try': [
            'Give two equal masses opposite velocities and watch them exchange velocities in an elastic collision.',
            'Compare the kinetic energy before and after an inelastic collision.',
        ],
    },
    {
        'script': 'energy_conservation', 'title': 'Energy Conservation', 'topic': 'mechanics',
        'image': '/images/energy_conservation.jpg',
        'description': 'Watch potential energy transform into kinetic energy, with air resistance and bouncing.',
        'physics': [
            'Without friction, mechanical energy is constant: '
            '<em>E</em> = &frac12;<em>m</em><em>v</em><sup>2</sup> + <em>m</em><em>g</em><em>h</em>. '
            'A falling object trades height for speed at exactly the rate needed to keep <em>E</em> fixed.',
            'Air resistance and imperfect bounces steadily drain mechanical energy into heat, which is why '
            'each bounce is lower than the last.',
        ],
        'try': [
            'Turn air resistance off and check the ball returns to its original height each bounce.',
            'Watch the kinetic and potential energy bars: their sum stays constant in the ideal case.',
        ],
    },
    {
        'script': 'friction', 'title': 'Friction Forces', 'topic': 'mechanics',
        'image': '/images/friction.jpg',
        'description': 'Understand static and kinetic friction with different surfaces and inclined planes.',
        'physics': [
            'Static friction adjusts itself to prevent sliding, up to a maximum of '
            '<em>&mu;</em><sub>s</sub><em>N</em>; once sliding starts, kinetic friction takes over with the '
            'roughly constant magnitude <em>&mu;</em><sub>k</sub><em>N</em> (usually smaller — which is why '
            'things lurch when they break free).',
            'On an incline, an object begins to slip when tan&thinsp;<em>&theta;</em> = <em>&mu;</em><sub>s</sub>, '
            'giving a simple way to measure the friction coefficient with nothing but a ramp.',
        ],
        'try': [
            'Increase the applied force gradually and find the moment static friction gives way.',
            'Tilt the incline until the block slips and compute μs from the angle.',
        ],
    },
    {
        'script': 'pendulum', 'title': 'Pendulum Motion', 'topic': 'ocw',
        'image': '/images/pendulum.jpg',
        'description': 'Simple harmonic motion and energy transfer in a pendulum, with damping effects.',
        'physics': [
            'For small angles a pendulum is a simple harmonic oscillator with period '
            '<em>T</em> = 2&pi;&radic;(<em>L</em>/<em>g</em>) — independent of the mass and, remarkably, '
            'of the amplitude. That independence is what made pendulum clocks possible.',
            'At larger angles the restoring force is no longer proportional to the displacement and the '
            'period grows with amplitude; damping slowly converts the energy sloshing between kinetic and '
            'potential into heat.',
        ],
        'try': [
            'Double the length and check the period grows by a factor of √2.',
            'Compare the period at 5° and 60° amplitude to see the small-angle approximation break down.',
        ],
    },
    {
        'script': 'faradays_law', 'title': "Faraday's Law", 'topic': 'em',
        'image': '/images/faradays.jpg',
        'description': 'A changing magnetic field induces current in a coil — electromagnetic induction.',
        'physics': [
            'A changing magnetic flux through a circuit induces an electromotive force: '
            '<em>&#8496;</em> = &minus;d<em>&Phi;</em><sub>B</sub>/d<em>t</em>. Only the <em>change</em> '
            'matters — a stationary magnet induces nothing.',
            'The minus sign is Lenz’s law: the induced current flows in the direction that opposes the '
            'change creating it, a direct consequence of energy conservation. This is the operating principle '
            'of generators, transformers, and induction stoves.',
        ],
        'try': [
            'Move the magnet quickly versus slowly and compare the induced current.',
            'Flip the magnet’s direction of motion and watch the current reverse, as Lenz’s law demands.',
        ],
    },
    {
        'script': 'newtonian_gravity', 'title': "Newton's Law of Gravitation", 'topic': 'astro',
        'image': '/images/newtonian_gravity.jpg',
        'description': 'Universal gravitation: every mass attracts every other with an inverse-square force.',
        'physics': [
            'Every pair of masses attracts with force '
            '<em>F</em> = <em>G</em><em>m</em><sub>1</sub><em>m</em><sub>2</sub>/<em>r</em><sup>2</sup>. '
            'The same law governs a falling apple and the Moon’s orbit — Newton’s great unification.',
            'An orbit is simply continuous free fall: the orbiting body accelerates toward the central mass '
            'but keeps missing it because of its sideways velocity. Too slow and it spirals in; too fast and '
            'it escapes.',
        ],
        'try': [
            'Vary the initial sideways velocity and find the value giving a circular orbit.',
            'Watch how the speed increases near closest approach on an elliptical orbit.',
        ],
    },
    {
        'script': 'hookes_law', 'title': "Hooke's Law", 'topic': 'ocw',
        'image': '/images/hookes.jpg',
        'description': 'A mass on a spring: restoring force proportional to displacement gives simple harmonic motion.',
        'physics': [
            'A spring pulls back with force proportional to its stretch: <em>F</em> = &minus;<em>k</em><em>x</em>. '
            'That linear restoring force produces simple harmonic motion with angular frequency '
            '<em>&omega;</em> = &radic;(<em>k</em>/<em>m</em>) and period <em>T</em> = 2&pi;&radic;(<em>m</em>/<em>k</em>).',
            'Almost any system near a stable equilibrium behaves like this for small displacements, which is '
            'why the harmonic oscillator shows up everywhere from molecular vibrations to circuit oscillations.',
        ],
        'try': [
            'Quadruple the mass and confirm the period doubles.',
            'Note that the period does not depend on the amplitude you start with.',
        ],
    },
    {
        'script': 'keplers_second_law', 'title': "Kepler's Second Law", 'topic': 'astro',
        'image': '/images/keplers_second.jpg',
        'description': 'A planet sweeps out equal areas in equal times — angular momentum conservation made visible.',
        'physics': [
            'The line from the Sun to a planet sweeps out equal areas in equal times. A planet therefore '
            'moves fastest at perihelion (closest approach) and slowest at aphelion.',
            'The law is nothing but conservation of angular momentum: gravity points along the Sun–planet '
            'line, exerts no torque, and so <em>L</em> = <em>m</em><em>r</em><sup>2</sup>&thinsp;d<em>&theta;</em>/d<em>t</em> '
            'stays constant — the swept-area rate is <em>L</em>/2<em>m</em>.',
        ],
        'try': [
            'Compare the planet’s speed at the two ends of an eccentric orbit.',
            'Check that the shaded area segments are equal even though their shapes differ.',
        ],
    },
    {
        'script': 'resistors', 'title': 'Resistors in Series and Parallel', 'topic': 'em',
        'image': '/images/resistors.jpg',
        'description': 'See how equivalent resistance builds up in series and parallel circuit configurations.',
        'physics': [
            'In series the same current flows through each resistor, so voltages add and '
            '<em>R</em><sub>eq</sub> = <em>R</em><sub>1</sub> + <em>R</em><sub>2</sub> + &hellip;. '
            'In parallel each resistor sees the full voltage, currents add, and '
            '1/<em>R</em><sub>eq</sub> = 1/<em>R</em><sub>1</sub> + 1/<em>R</em><sub>2</sub> + &hellip;.',
            'Adding a resistor in parallel always <em>lowers</em> the total resistance — you’ve opened '
            'another path for current, so more flows at the same voltage.',
        ],
        'try': [
            'Put two equal resistors in parallel and confirm the equivalent resistance halves.',
            'Compare the current drawn from the battery in the two configurations.',
        ],
    },
    {
        'script': 'capacitors', 'title': 'Capacitors in Series and Parallel', 'topic': 'em',
        'image': '/images/capacitors.jpg',
        'description': 'See how equivalent capacitance builds up — the mirror image of the resistor rules.',
        'physics': [
            'Capacitors combine the opposite way to resistors: in parallel the plate areas effectively add, '
            'so <em>C</em><sub>eq</sub> = <em>C</em><sub>1</sub> + <em>C</em><sub>2</sub> + &hellip;; in series '
            'the same charge sits on every capacitor and 1/<em>C</em><sub>eq</sub> = 1/<em>C</em><sub>1</sub> + '
            '1/<em>C</em><sub>2</sub> + &hellip;.',
            'The reason is what adds in each case: in parallel the capacitors share the voltage and the '
            'charges add; in series they share the charge and the voltages add (<em>Q</em> = <em>C</em><em>V</em>).',
        ],
        'try': [
            'Check that two equal capacitors in series give half the capacitance of one.',
            'Follow where the charge accumulates in each configuration.',
        ],
    },
    {
        'script': 'gauss_law', 'title': "Gauss' Law", 'topic': 'em',
        'image': '/images/gauss.jpg',
        'description': 'The electric flux through a closed surface depends only on the charge inside it.',
        'physics': [
            'Gauss’ law states that the electric flux through any closed surface equals the enclosed '
            'charge divided by <em>&epsilon;</em><sub>0</sub>: '
            '&#8750;&thinsp;<strong>E</strong>&thinsp;&middot;&thinsp;d<strong>A</strong> = '
            '<em>Q</em><sub>enc</sub>/<em>&epsilon;</em><sub>0</sub>. Charges outside the surface contribute '
            'nothing — their field lines enter and leave in equal measure.',
            'With enough symmetry (spheres, cylinders, planes) this single statement lets you find the '
            'field without integrating over the charge distribution — one of the most powerful shortcuts '
            'in electrostatics.',
        ],
        'try': [
            'Move a charge in and out of the Gaussian surface and watch the flux jump.',
            'Note the flux doesn’t change as you move a charge around <em>inside</em> the surface.',
        ],
    },
    {
        'script': 'coulombs_law', 'title': "Coulomb's Law", 'topic': 'em',
        'image': '/images/coulomb.jpg',
        'description': 'The inverse-square force between charges: attraction, repulsion, and superposition.',
        'physics': [
            'Two point charges exert forces along the line joining them with magnitude '
            '<em>F</em> = <em>k</em><em>q</em><sub>1</sub><em>q</em><sub>2</sub>/<em>r</em><sup>2</sup>, '
            'repulsive for like charges, attractive for opposite ones. It has the same inverse-square form '
            'as gravity but is enormously stronger and comes in two signs.',
            'Forces from multiple charges simply add as vectors (superposition), which is what makes the '
            'electric field such a useful concept.',
        ],
        'try': [
            'Halve the distance between two charges and confirm the force quadruples.',
            'Set up three charges and watch how the net force on one is the vector sum of two pair forces.',
        ],
    },
    {
        # Full-screen WebGL2 sim with its own hand-written page (see
        # pages/simulations/relativistic-aberration.html). Listed on the
        # Simulations page but not generated from the template below.
        'script': None, 'title': 'Relativistic Aberration', 'topic': 'astro',
        'image': '/images/relativistic-aberration.svg',
        'description': 'Fly through a star field near light speed and watch relativistic aberration, Doppler shift, and beaming distort the sky.',
        'custom_page': True,
        'href': '/pages/simulations/relativistic-aberration.html',
    },
]


def make_slug(title):
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'\s+', '-', slug.strip())
    slug = re.sub(r'-+', '-', slug)
    return slug


def build_page(sim, slug):
    esc_title = html_escape(sim['title'])
    desc      = html_escape(sim['description'])
    canonical = f'{SITE_URL}/pages/simulations/{slug}.html'
    og_image  = f"{SITE_URL}{sim['image']}"
    physics   = '\n'.join(f'        <p>{p}</p>' for p in sim.get('physics', []))
    tries     = '\n'.join(f'            <li>{t}</li>' for t in sim.get('try', []))
    json_ld   = json.dumps({
        '@context': 'https://schema.org',
        '@type': 'LearningResource',
        'name': sim['title'],
        'description': sim['description'],
        'url': canonical,
        'image': og_image,
        'learningResourceType': 'Interactive simulation',
        'educationalLevel': 'Undergraduate',
        'author': {'@type': 'Person', 'name': 'Adam Field',
                   'url': 'https://www.adamfield.org/'},
    }, indent=2)
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{esc_title} — Adam Field</title>
    <meta name="description" content="{desc}">
    <meta name="author" content="Adam Field">
    <link rel="canonical" href="{canonical}">

    <!-- Icons -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">

    <!-- Open Graph / social cards -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="{esc_title} — Adam Field">
    <meta property="og:description" content="{desc}">
    <meta property="og:url" content="{canonical}">
    <meta property="og:image" content="{og_image}">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:image" content="{og_image}">

    <script type="application/ld+json">
{json_ld}
    </script>

    <link rel="stylesheet" href="/styles/style.css">
</head>
<body>
    <header>
        <h1>{esc_title}</h1>
    </header>

    {layout.NAV_START}
{layout.render_nav(active_href='/pages/sims.html')}
    {layout.NAV_END}

    <div id="simulation-container"></div>

    <section class="sim-notes">
        <h2>The Physics</h2>
{physics}
        <h3>Things to Try</h3>
        <ul>
{tries}
        </ul>
    </section>

    <script src="/scripts/{sim['script']}.js"></script>

    {layout.FOOTER_START}
{layout.render_footer()}
    {layout.FOOTER_END}
</body>
</html>'''


index = []

for sim in SIMULATIONS:
    slug = make_slug(sim['title'])

    if sim.get('custom_page'):
        # Hand-written page (e.g. the full-screen relativistic sim). Listed on
        # the Simulations page but not generated from the template.
        href = sim['href']
        print(f'  (custom)  {slug}.html — using hand-written page')
    else:
        href = f'/pages/simulations/{slug}.html'
        html = build_page(sim, slug)
        out_path = os.path.join(OUT_DIR, f'{slug}.html')
        open(out_path, 'w', encoding='utf8').write(html)
        print(f'  built {slug}.html')

    index.append({
        'title':       sim['title'],
        'description': sim['description'],
        'topic':       sim['topic'],
        'image':       sim['image'],
        'href':        href
    })

open(os.path.join(ROOT, 'simulations.json'), 'w', encoding='utf8').write(
    json.dumps(index, indent=2)
)
print(f'  wrote simulations.json ({len(index)} sims)')

# sitemap.xml / robots.txt / feed.xml are written by build_blogs.py, which reads
# simulations.json so the whole site lives in one sitemap. Run build_sims.py
# before build_blogs.py (scripts/build.py does this).

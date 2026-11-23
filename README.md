# Real-Time Rendering Studio

An interactive WebGL2 lighting lab built with JavaScript, GLSL, HTML, and CSS.

I built this project to experiment with the shading, normal mapping, and shadow mapping concepts I learned in my Computer Graphics course. It lets users compare techniques directly by adjusting a scene in real time.

## Live Demo

[Try Real-Time Rendering Studio](https://anain0404.github.io/real-time-rendering-studio/)

## Features

- Real-time 3D cube and floor rendering using WebGL2
- Phong-style diffuse and specular illumination
- Procedural tangent-space normal perturbation
- Shadow mapping using a light-space depth texture
- 3×3 percentage-closer shadow filtering
- Surface normals and shadow-depth visualization modes
- Three lighting presets: Clay Studio, Midnight, and Golden Hour
- Adjustable light intensity, ambient lighting, shininess, and normal detail
- Three material styles and an animated point light
- Orbit camera, zoom, reset, and PNG export
- Runs in a browser without external libraries or build tools

## How it works

The scene is rendered in two passes. A depth pass first renders the geometry from the light's point of view to create a shadow map. The main pass renders the same geometry from the camera using ambient, diffuse, and specular shading. For shadowed areas, each fragment compares its light-space depth with the stored depth map.

The normal-mapping option perturbs surface normals using a procedural function in tangent space. This adds visible surface detail without changing the geometry. The normal visualization mode displays the resulting normals as colors, making the effect easier to compare.

The lighting model is Phong-style rather than physically based, and the scene uses a perspective shadow map from a point-positioned light rather than omnidirectional cube-map shadows.

## Tech Stack

| Technology | Purpose |
| --- | --- |
| JavaScript | Scene setup, matrix calculations, and controls |
| WebGL2 | Real-time GPU rendering and depth framebuffer |
| GLSL ES 3.00 | Lighting, normal mapping, and shadow calculations |
| HTML | Canvas and interface controls |
| CSS | Layout and responsive styling |

## Getting Started

```bash
git clone https://github.com/anain0404/real-time-rendering-studio.git
cd real-time-rendering-studio
python3 -m http.server 8002
```

Open `http://localhost:8002` in a WebGL2-capable browser.

## Controls

| Action | Control |
| --- | --- |
| Rotate the camera | Drag on the scene |
| Zoom | Scroll or trackpad |
| Reset the camera | Double-click the scene |
| Change appearance | Choose a scene preset |
| Compare shading | Visualization mode dropdown |
| Turn surface detail on or off | Normal mapping checkbox |
| Compare shadow effects | Shadow mapping checkbox |
| Animate the key light | Animate light checkbox |
| Change lighting | Intensity and ambient sliders |
| Change material | Material dropdown, shininess and normal detail sliders |
| Save a screenshot | Export PNG |

## Project Structure

```text
real-time-rendering-studio/
├── index.html
├── render-studio.js
├── render-studio.css
├── .gitignore
└── README.md
```

## Future Improvements

- Import custom 3D meshes
- Add multiple independently controlled lights
- Add more configurable normal maps and textures
- Experiment with physically based rendering
- Add a side-by-side comparison mode

## About This Project

I wanted a way to see how the rendering techniques I was learning actually change the appearance of a 3D scene. Being able to toggle normal mapping, view surface normals, and switch shadow mapping on and off makes it easier to understand what each part of the rendering pipeline contributes.

## Author

**Anvesha Nain**

[Portfolio](https://anain0404.github.io/anvesha-portfolio/) | [GitHub](https://github.com/anain0404) | [LinkedIn](https://www.linkedin.com/in/anvesha-nain-a14033223/)


# Real-Time Rendering Studio

An interactive 3D graphics and lighting playground built with **WebGL2, GLSL, and JavaScript**.

This is a personal project where I experimented with and expanded on concepts I learned in my Computer Graphics course, including Phong shading, normal mapping, shadow mapping, and real-time rendering.

Real-Time Rendering Studio lets users explore how different lighting techniques, surface properties, and rendering settings affect the appearance of a 3D scene. Users can adjust lighting, switch between rendering modes, and compare visual effects directly in their browser.

##  Live Demo

**[Try Real-Time Rendering Studio](https://anain0404.github.io/real-time-rendering-studio/)**

Experiment with different lighting conditions, materials, and rendering techniques in real time.

##  Features

### Real-Time Rendering
- GPU-accelerated 3D rendering using WebGL2
- Interactive 3D cube and floor scene
- Phong-style diffuse and specular illumination
- Shadow mapping using a light-space depth texture
- 3×3 percentage-closer filtering for shadow edges
- Procedural tangent-space normal perturbation
- Surface normal and shadow-depth visualization modes

### Lighting & Materials
- Three lighting presets: Clay Studio, Midnight, and Golden Hour
- Adjustable light intensity and ambient illumination
- Configurable material shininess and surface detail
- Three material styles
- Animated light source
- Toggle normal mapping and shadow mapping independently

### Camera & Interface
- Interactive orbit camera
- Zoom using the mouse wheel or trackpad
- Double-click to reset camera position
- Real-time rendering controls
- Export the rendered scene as a PNG image
- Responsive interface with no external dependencies

##  Tech Stack

| Technology | Purpose |
|------------|---------|
| JavaScript | Scene setup, matrix calculations, and interactive controls |
| WebGL2 | GPU rendering, depth textures, and framebuffer management |
| GLSL ES 3.00 | Vertex and fragment shaders, lighting, normals, and shadows |
| HTML5 | Rendering canvas and application controls |
| CSS3 | Interface design and responsive layout |

## ⚙️ How It Works

Real-Time Rendering Studio uses a multi-pass rendering pipeline to calculate lighting and shadows in a 3D scene.

### 1. Scene Geometry

The application renders a 3D cube and a ground plane. Vertex transformations position the geometry relative to the camera and light source.

### 2. Phong Shading

The fragment shader calculates ambient, diffuse, and specular lighting.

- **Ambient lighting** provides a base level of illumination.
- **Diffuse lighting** changes based on the angle between the light direction and surface normal.
- **Specular lighting** creates highlights based on the viewing direction and material shininess.

Users can adjust these properties to see how lighting changes the appearance of the scene.

### 3. Normal Mapping

The application uses procedural tangent-space normal perturbation to simulate additional surface detail.

Instead of modifying the underlying geometry, the shader changes the normals used in lighting calculations.

Users can toggle normal mapping and adjust its strength to compare smooth and detailed surfaces.

### 4. Shadow Mapping

Shadows are calculated using a two-pass rendering process.

**Depth Pass**

The scene is rendered from the light's perspective, and depth values are stored in a shadow map.

**Main Rendering Pass**

The scene is rendered from the camera's perspective. Each fragment compares its light-space depth against the shadow map to determine whether it is illuminated or shadowed.

A 3×3 percentage-closer filtering technique samples nearby depth values to produce smoother shadow boundaries.

### 5. Rendering Visualization

The application supports different visualization modes to make the rendering techniques easier to understand.

Users can compare the final shaded scene with surface-normal and shadow-depth visualizations.

The project uses a Phong-style lighting model rather than physically based rendering. Its shadow implementation uses a perspective depth map from a point-positioned light rather than omnidirectional cube-map shadows.

##  Getting Started

### Run Locally

**1. Clone the repository**

```bash
git clone https://github.com/anain0404/real-time-rendering-studio.git
```

**2. Navigate to the project folder**

```bash
cd real-time-rendering-studio
```

**3. Start a local server**

```bash
python3 -m http.server 8002
```

**4. Open the application**

Navigate to:

http://localhost:8002

The application requires a WebGL2-compatible browser, such as Chrome, Firefox, Safari, or Edge.

No additional libraries or build tools are required.

Alternatively, try the **[Live Demo](https://anain0404.github.io/real-time-rendering-studio/)** without installing anything.

##  Controls

| Action | Control |
|--------|---------|
| Rotate the camera | Click and drag |
| Zoom | Mouse wheel or trackpad |
| Reset camera | Double-click the scene |
| Change lighting preset | Select Clay Studio, Midnight, or Golden Hour |
| Compare rendering techniques | Visualization mode dropdown |
| Enable or disable surface detail | Normal mapping checkbox |
| Enable or disable shadows | Shadow mapping checkbox |
| Animate lighting | Animate light checkbox |
| Adjust illumination | Light intensity and ambient sliders |
| Change material appearance | Material dropdown |
| Adjust surface highlights | Shininess slider |
| Adjust normal detail | Normal detail slider |
| Export image | Export PNG |

##  Project Structure

```text
real-time-rendering-studio/
├── index.html
├── render-studio.js
├── render-studio.css
├── .gitignore
└── README.md
```

##  Future Improvements

As I continue experimenting with computer graphics, I would like to explore:

- Importing custom 3D models and meshes
- Adding multiple independently controlled lights
- Experimenting with different textures and normal maps
- Implementing physically based rendering techniques
- Creating a side-by-side rendering comparison mode
- Adding more complex scenes and materials

##  About This Project

I started Real-Time Rendering Studio because I wanted to experiment more with the lighting and shading techniques I was learning in my Computer Graphics course.

I was particularly interested in seeing how different parts of the rendering pipeline affect the final appearance of a scene. Being able to toggle normal mapping, visualize surface normals, and compare shadows makes it easier to see what each technique actually does.

Through this project, I got to explore shader programming, lighting calculations, depth buffers, and interactive 3D graphics while building an application where I could experiment with different rendering settings.

##  Author

**Anvesha Nain**

[Portfolio](https://anain0404.github.io/anvesha-portfolio/) | [GitHub](https://github.com/anain0404) | [LinkedIn](https://www.linkedin.com/in/anvesha-nain-a14033223/)

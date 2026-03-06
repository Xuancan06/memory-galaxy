import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/build/three.module.js'
import { OrbitControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/controls/OrbitControls.js'

const canvas = document.querySelector('canvas.webgl')
const preview = document.getElementById('preview')
const previewImage = document.getElementById('previewImage')
const previewTitle = document.getElementById('previewTitle')
const previewClose = document.getElementById('previewClose')
const loadingScreen = document.getElementById('loadingScreen')
const loadingFill = document.getElementById('loadingFill')
const loadingPercent = document.getElementById('loadingPercent')
const loadingSub = document.getElementById('loadingSub')
const loadingStep = document.getElementById('loadingStep')
const loadingQuote = document.getElementById('loadingQuote')

const fallbackFiles = Array.from({ length: 60 }, (_, index) => `memory-${String(index + 1).padStart(3, '0')}.webp`)

const loadingQuotes = [
    '"8/3 nay, mong em cuoi that xinh nhu mot vi sao."',
    '"Ngan ha co hang ty vi sao, con anh chi thay em la dep nhat."',
    '"Dang gom tung anh nho de bien thanh mot vu tru de thuong."',
    '"Gan xong roi, chuc em 8/3 luon ruc ro va binh yen."'
]

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
const updateLoading = (progress, stepText = '', subText = '') => {
    const safe = clamp(progress, 0, 100)
    loadingFill.style.width = `${safe}%`
    loadingPercent.textContent = `${Math.round(safe)}%`
    if (stepText) {
        loadingStep.textContent = stepText
    }
    if (subText) {
        loadingSub.textContent = subText
    }
    const quoteIndex = Math.min(
        loadingQuotes.length - 1,
        Math.floor((safe / 100) * loadingQuotes.length)
    )
    loadingQuote.textContent = loadingQuotes[quoteIndex]
}

const finishLoading = () => {
    updateLoading(100, 'Ready', 'Open the galaxy...')
    setTimeout(() => {
        loadingScreen.classList.add('hidden')
    }, 420)
}

updateLoading(3, 'Boot', 'Starting stars...')

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const scene = new THREE.Scene()
scene.fog = new THREE.FogExp2('#0a0b20', 0.05)

const camera = new THREE.PerspectiveCamera(63, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 1.2, 9.8)
scene.add(camera)

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
})
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.03
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(sizes.width, sizes.height)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enablePan = false
controls.minDistance = 4.4
controls.maxDistance = 15.4
controls.rotateSpeed = 0.78
controls.target.set(0, 0, 0)

const ambient = new THREE.AmbientLight(0xffefff, 0.62)
scene.add(ambient)

const keyLight = new THREE.PointLight(0xffabf4, 1.2, 44, 2)
keyLight.position.set(2.1, 1.9, 2.4)
scene.add(keyLight)

const rimLight = new THREE.PointLight(0x8eb4ff, 0.84, 46, 2)
rimLight.position.set(-3.2, 1.6, -3.1)
scene.add(rimLight)

const coreGroup = new THREE.Group()
scene.add(coreGroup)

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.45, 64, 64),
    new THREE.MeshPhysicalMaterial({
        color: 0xffb6f1,
        emissive: 0xd666e8,
        emissiveIntensity: 0.56,
        roughness: 0.2,
        metalness: 0.08,
        clearcoat: 0.6,
        clearcoatRoughness: 0.14,
        transmission: 0.2,
        transparent: true,
        opacity: 0.96
    })
)
coreGroup.add(sphere)

const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xfff1ff,
    transparent: true,
    opacity: 0.72
})

const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.58, 0.036, 20, 160), ringMaterial.clone())
ring1.rotation.set(1.08, 0.42, 0.22)
coreGroup.add(ring1)

const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.028, 20, 160), ringMaterial.clone())
ring2.rotation.set(-0.54, 0.24, 1.35)
ring2.material.opacity = 0.48
coreGroup.add(ring2)

const createRadialTexture = (innerColor, midColor) => {
    const size = 256
    const cvs = document.createElement('canvas')
    cvs.width = size
    cvs.height = size
    const ctx = cvs.getContext('2d')
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)

    grad.addColorStop(0, innerColor)
    grad.addColorStop(0.4, midColor)
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)

    const tex = new THREE.CanvasTexture(cvs)
    tex.needsUpdate = true
    return tex
}

const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
        map: createRadialTexture('rgba(255,255,255,0.95)', 'rgba(255,214,248,0.6)'),
        color: 0xffd8fb,
        transparent: true,
        opacity: 0.76,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    })
)
glow.scale.set(4.35, 4.35, 1)
coreGroup.add(glow)

const starGeo = new THREE.BufferGeometry()
const starCount = 3000
const starPositions = new Float32Array(starCount * 3)

for (let i = 0; i < starCount; i++) {
    const i3 = i * 3
    const radius = 18 + Math.random() * 26
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)

    starPositions[i3] = Math.sin(phi) * Math.cos(theta) * radius
    starPositions[i3 + 1] = Math.cos(phi) * radius
    starPositions[i3 + 2] = Math.sin(phi) * Math.sin(theta) * radius
}

starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))

const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({
        size: 0.05,
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
        depthWrite: false
    })
)
scene.add(stars)

const memoryGroup = new THREE.Group()
scene.add(memoryGroup)

const sparkleGroup = new THREE.Group()
scene.add(sparkleGroup)

const sprites = []
const sparkles = []
const tempVec = new THREE.Vector3()

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()

const textureLoader = new THREE.TextureLoader()
const loadTexture = (fileName) => new Promise((resolve) => {
    textureLoader.load(
        `images/${fileName}`,
        (texture) => {
            texture.encoding = THREE.sRGBEncoding
            texture.minFilter = THREE.LinearFilter
            texture.magFilter = THREE.LinearFilter
            texture.needsUpdate = true
            resolve(texture)
        },
        undefined,
        () => resolve(null)
    )
})

const getImageFiles = async () => {
    try {
        const response = await fetch('images/manifest.json')
        if (!response.ok) {
            return fallbackFiles
        }
        const manifest = await response.json()
        const files = manifest.filter((file) => /\.(png|jpe?g|webp|gif|avif)$/i.test(file))
        return files.length > 0 ? files : fallbackFiles
    } catch (error) {
        return fallbackFiles
    }
}

const createMemorySprite = (texture, fileName, index) => {
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.95,
        depthWrite: false
    })

    const sprite = new THREE.Sprite(material)
    const frontLayer = Math.random() < 0.72
    const baseScale = frontLayer ? THREE.MathUtils.randFloat(0.5, 1.18) : THREE.MathUtils.randFloat(0.36, 0.78)
    const aspect = THREE.MathUtils.randFloat(0.84, 1.32)

    sprite.userData = {
        fileName,
        baseScale,
        aspect,
        radius: frontLayer ? THREE.MathUtils.randFloat(3.2, 8.4) : THREE.MathUtils.randFloat(5.3, 11),
        theta: Math.random() * Math.PI * 2,
        thetaSpeed: THREE.MathUtils.randFloat(0.2, 0.64) * (Math.random() < 0.5 ? -1 : 1),
        radialAmp: THREE.MathUtils.randFloat(0.08, 0.34),
        radialFreq: THREE.MathUtils.randFloat(0.6, 1.7),
        orbitBand: frontLayer ? THREE.MathUtils.randFloat(-1.05, 1.05) : THREE.MathUtils.randFloat(-0.84, 0.84),
        verticalAmp: frontLayer ? THREE.MathUtils.randFloat(0.04, 0.26) : THREE.MathUtils.randFloat(0.03, 0.18),
        verticalFreq: THREE.MathUtils.randFloat(0.7, 1.7),
        phase: Math.random() * Math.PI * 2,
        globalSpin: frontLayer ? THREE.MathUtils.randFloat(0.76, 1.2) : THREE.MathUtils.randFloat(0.62, 0.98),
        cardTilt: THREE.MathUtils.randFloat(-0.14, 0.14),
        cardTiltSpeed: THREE.MathUtils.randFloat(0.4, 1.05),
        index
    }

    sprite.scale.set(baseScale * aspect, baseScale, 1)
    memoryGroup.add(sprite)
    sprites.push(sprite)
}

const createSparkleTexture = () => {
    const size = 192
    const cvs = document.createElement('canvas')
    cvs.width = size
    cvs.height = size
    const ctx = cvs.getContext('2d')

    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(0.25, 'rgba(255,255,255,0.95)')
    grad.addColorStop(0.5, 'rgba(255,210,246,0.45)')
    grad.addColorStop(1, 'rgba(255,210,246,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)

    ctx.strokeStyle = 'rgba(255,255,255,0.65)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(size / 2, size * 0.16)
    ctx.lineTo(size / 2, size * 0.84)
    ctx.moveTo(size * 0.16, size / 2)
    ctx.lineTo(size * 0.84, size / 2)
    ctx.stroke()

    const tex = new THREE.CanvasTexture(cvs)
    tex.needsUpdate = true
    return tex
}

const createSparkles = () => {
    const texture = createSparkleTexture()
    const sparkleColors = [0xffffff, 0xffd8f8, 0xcfe0ff]
    const count = 180

    for (let i = 0; i < count; i++) {
        const material = new THREE.SpriteMaterial({
            map: texture,
            color: sparkleColors[Math.floor(Math.random() * sparkleColors.length)],
            transparent: true,
            opacity: THREE.MathUtils.randFloat(0.18, 0.74),
            depthWrite: false,
            blending: THREE.AdditiveBlending
        })

        const sparkle = new THREE.Sprite(material)
        const baseScale = THREE.MathUtils.randFloat(0.05, 0.16)

        sparkle.userData = {
            baseScale,
            radius: THREE.MathUtils.randFloat(2.4, 11.4),
            theta: Math.random() * Math.PI * 2,
            thetaSpeed: THREE.MathUtils.randFloat(0.15, 0.52) * (Math.random() < 0.5 ? -1 : 1),
            orbitBand: THREE.MathUtils.randFloat(-1.35, 1.35),
            verticalAmp: THREE.MathUtils.randFloat(0.02, 0.15),
            verticalFreq: THREE.MathUtils.randFloat(0.9, 2.1),
            pulseFreq: THREE.MathUtils.randFloat(1.2, 3.2),
            phase: Math.random() * Math.PI * 2
        }

        sparkle.scale.set(baseScale, baseScale, 1)
        sparkles.push(sparkle)
        sparkleGroup.add(sparkle)
    }
}

createSparkles()

const buildMemoryCloud = async () => {
    updateLoading(10, 'Manifest', 'Reading image list...')
    const imageFiles = await getImageFiles()

    const targetCount = Math.min(148, Math.max(72, imageFiles.length * 3))
    const selections = Array.from({ length: targetCount }, (_, i) => imageFiles[i % imageFiles.length])

    updateLoading(18, 'Texture', `Loading images 0/${selections.length}`)
    let loaded = 0

    const results = await Promise.all(
        selections.map(async (fileName) => {
            const texture = await loadTexture(fileName)
            loaded += 1
            const progress = 18 + (loaded / selections.length) * 72
            updateLoading(progress, 'Texture', `Loading images ${loaded}/${selections.length}`)
            return { fileName, texture }
        })
    )

    results.forEach(({ fileName, texture }, index) => {
        if (!texture) {
            return
        }
        createMemorySprite(texture, fileName, index)
    })

    updateLoading(96, 'Compose', 'Arranging orbit...')
    setTimeout(() => {
        finishLoading()
    }, 180)
}

const setPreviewVisible = (visible) => {
    preview.classList.toggle('visible', visible)
    controls.enabled = !visible
    if (visible) {
        canvas.style.cursor = 'default'
        return
    }
    canvas.style.cursor = 'grab'
}

const openPreview = (fileName) => {
    if (!fileName) {
        return
    }
    previewImage.src = `images/${fileName}`
    previewTitle.textContent = fileName
    setPreviewVisible(true)
}

const closePreview = () => {
    setPreviewVisible(false)
    previewImage.removeAttribute('src')
    previewTitle.textContent = ''
}

previewClose.addEventListener('click', closePreview)
preview.addEventListener('click', (event) => {
    if (event.target === preview) {
        closePreview()
    }
})

window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && preview.classList.contains('visible')) {
        closePreview()
    }
})

const getSpriteHit = (event) => {
    if (sprites.length === 0 || preview.classList.contains('visible')) {
        return null
    }

    const rect = canvas.getBoundingClientRect()
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(pointer, camera)
    const intersections = raycaster.intersectObjects(sprites, false)
    return intersections.length > 0 ? intersections[0].object : null
}

let pointerDown = null
let pointerDragged = false

canvas.addEventListener('pointerdown', (event) => {
    pointerDown = { x: event.clientX, y: event.clientY }
    pointerDragged = false
    if (!preview.classList.contains('visible')) {
        canvas.style.cursor = 'grabbing'
    }
})

canvas.addEventListener('pointermove', (event) => {
    if (pointerDown !== null) {
        const dragDistance = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y)
        if (dragDistance > 6) {
            pointerDragged = true
        }
    }

    if (preview.classList.contains('visible') || pointerDragged) {
        return
    }

    const hitSprite = getSpriteHit(event)
    canvas.style.cursor = hitSprite ? 'pointer' : 'grab'
})

window.addEventListener('pointerup', (event) => {
    if (preview.classList.contains('visible')) {
        pointerDown = null
        pointerDragged = false
        return
    }

    if (pointerDragged || pointerDown === null) {
        pointerDown = null
        pointerDragged = false
        canvas.style.cursor = 'grab'
        return
    }

    const hitSprite = getSpriteHit(event)
    pointerDown = null
    pointerDragged = false

    if (!hitSprite) {
        canvas.style.cursor = 'grab'
        return
    }
    openPreview(hitSprite.userData.fileName)
})

canvas.addEventListener('pointerleave', () => {
    if (!preview.classList.contains('visible')) {
        canvas.style.cursor = 'grab'
    }
})

canvas.addEventListener('pointercancel', () => {
    pointerDown = null
    pointerDragged = false
    if (!preview.classList.contains('visible')) {
        canvas.style.cursor = 'grab'
    }
})

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const clock = new THREE.Clock()
let elapsed = 0

const animate = () => {
    const delta = clock.getDelta()
    elapsed += delta

    coreGroup.rotation.y += delta * 0.24
    sphere.rotation.y += delta * 0.16
    sphere.rotation.x += delta * 0.07

    ring1.rotation.z += delta * 0.29
    ring2.rotation.z -= delta * 0.2

    const glowPulse = 1 + Math.sin(elapsed * 1.55) * 0.07
    glow.scale.set(4.35 * glowPulse, 4.35 * glowPulse, 1)
    glow.material.opacity = 0.68 + Math.sin(elapsed * 2.15) * 0.1

    memoryGroup.rotation.y += delta * 0.048
    sparkleGroup.rotation.y -= delta * 0.04

    for (let i = 0; i < sprites.length; i++) {
        const sprite = sprites[i]
        const data = sprite.userData

        data.theta += data.thetaSpeed * delta
        const theta = data.theta + elapsed * 0.115 * data.globalSpin
        const radius = data.radius + Math.sin(elapsed * data.radialFreq + data.phase) * data.radialAmp

        tempVec.x = Math.cos(theta) * radius
        tempVec.z = Math.sin(theta) * radius
        tempVec.y = data.orbitBand + Math.sin(elapsed * data.verticalFreq + data.phase) * data.verticalAmp + Math.sin(theta * 1.5 + data.phase) * 0.12
        sprite.position.copy(tempVec)

        const dist = camera.position.distanceTo(sprite.position)
        const depth = THREE.MathUtils.clamp(8.4 / dist, 0.54, 1.82)
        const breathe = 1 + Math.sin(elapsed * 1.3 + data.phase) * 0.035
        const scale = data.baseScale * depth * breathe

        sprite.scale.set(scale * data.aspect, scale, 1)
        sprite.material.rotation = data.cardTilt + Math.sin(elapsed * data.cardTiltSpeed + data.phase) * 0.05
        sprite.material.opacity = THREE.MathUtils.clamp(0.28 + depth * 0.75, 0.26, 0.96)
    }

    for (let i = 0; i < sparkles.length; i++) {
        const sparkle = sparkles[i]
        const data = sparkle.userData

        data.theta += data.thetaSpeed * delta
        const theta = data.theta + elapsed * 0.08
        const radius = data.radius + Math.sin(elapsed * 0.9 + data.phase) * 0.1
        const y = data.orbitBand + Math.sin(elapsed * data.verticalFreq + data.phase) * data.verticalAmp

        sparkle.position.set(Math.cos(theta) * radius, y, Math.sin(theta) * radius)

        const pulse = 1 + Math.sin(elapsed * data.pulseFreq + data.phase) * 0.4
        const scale = data.baseScale * pulse
        sparkle.scale.set(scale, scale, 1)
        sparkle.material.opacity = THREE.MathUtils.clamp(0.12 + pulse * 0.42, 0.12, 0.86)
    }

    stars.material.opacity = 0.82 + Math.sin(elapsed * 0.85) * 0.08

    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(animate)
}

buildMemoryCloud()
animate()


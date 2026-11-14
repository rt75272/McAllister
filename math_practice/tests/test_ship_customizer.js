const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../static/js/ship_customizer.js'), 'utf8');

function setup(saved) {
    let stored = saved ? JSON.stringify(saved) : null;
    let failSave = false;
    let crop;
    const errors = [];
    const controls = {};
    const vector = () => ({ x: 0, y: 0, z: 0, set(x, y, z) { Object.assign(this, { x, y, z }); }, setScalar(value) { this.value = value; } });
    class Element {
        constructor() { this.listeners = {}; this.dataset = {}; this.style = {}; this.hidden = false; this.files = []; }
        addEventListener(type, handler) { this.listeners[type] = handler; }
        fire(type) { this.listeners[type]({ currentTarget: this, stopPropagation() {} }); }
        setAttribute(name, value) { this[name] = value; }
        removeAttribute(name) { delete this[name]; }
    }
    const inputs = ['style', 'body', 'wings', 'exhaust', 'size', 'markings'].map(key => {
        const element = new Element();
        element.dataset.k = key;
        controls[key] = element;
        return element;
    });
    for (const name of ['toggle', 'photo', 'remove', 'reset', 'status', 'preview']) controls[name] = new Element();
    const panel = new Element();
    panel.classList = { toggle: () => true };
    panel.querySelectorAll = () => inputs;
    panel.querySelector = selector => controls[selector.slice(4)];
    const document = {
        head: { appendChild() {} },
        body: { appendChild() {} },
        createElement(tag) {
            if (tag === 'div') return panel;
            if (tag === 'canvas') return {
                getContext: () => ({ drawImage: (...args) => { crop = args.slice(1); } }),
                toDataURL: () => 'data:image/png;base64,test'
            };
            return new Element();
        }
    };
    class Geometry {
        constructor() {
            this.positions = { count: 4, points: [[-.5, 0, -.5], [.5, 0, -.5], [-.5, 0, .5], [.5, 0, .5]] };
        }
        clone() { return new Geometry(); }
        getAttribute() { return this.positions; }
        setAttribute(name, value) { this[name] = value; }
        dispose() {}
    }
    class Material {
        constructor(options) { Object.assign(this, options); }
        dispose() {}
    }
    class Mesh {
        constructor(geometry, material) {
            this.geometry = geometry;
            this.material = material;
            this.position = vector();
            this.rotation = vector();
            this.scale = vector();
        }
        clone() { return new Mesh(this.geometry, this.material); }
        updateMatrix() { this.matrix = { position: this.position }; }
    }
    class Texture { constructor(image) { this.image = image; } dispose() {} }
    const THREE = {
        Color: class {}, Mesh, Texture, CanvasTexture: Texture,
        Vector3: class {
            fromBufferAttribute(attribute, index) {
                [this.x, this.y, this.z] = attribute.points[index];
                return this;
            }
            applyMatrix4(matrix) {
                this.x += matrix.position.x;
                this.z += matrix.position.z;
                return this;
            }
        },
        Float32BufferAttribute: class { constructor(array) { this.array = array; } },
        MeshStandardMaterial: Material, MeshBasicMaterial: Material,
        CylinderGeometry: Geometry, SphereGeometry: Geometry, ConeGeometry: Geometry,
        BoxGeometry: Geometry, PlaneGeometry: Geometry
    };
    class Image {
        constructor() { this.width = 400; this.height = 200; }
        set src(value) { this.onload(); }
    }
    class FileReader {
        readAsDataURL() { this.result = 'data:image/png;base64,test'; this.onload(); }
    }
    const localStorage = {
        getItem: () => stored,
        setItem: (key, value) => {
            if (failSave) throw new Error('Storage unavailable');
            stored = value;
        }
    };
    const ship = {
        children: [], scale: vector(),
        add(...children) { this.children.push(...children); },
        remove(child) { this.children.splice(this.children.indexOf(child), 1); }
    };
    const window = {};
    vm.runInNewContext(source, { window, document, THREE, localStorage, Image, FileReader, console: { error: (...args) => errors.push(args) } });
    window.initShipCustomizer(ship);
    return {
        controls, ship, saved: () => JSON.parse(stored),
        crop: () => crop, errors, failSave: value => { failSave = value; }
    };
}

test('legacy ships retain their settings and new shapes and markings persist', () => {
    const { controls, ship, saved } = setup({ style: 'rocket', body: '#abcdef', wings: '#123456', exhaust: '#112233', size: 1.4 });
    assert.equal(controls.style.value, 'rocket');
    assert.equal(controls.markings.value, 'none');
    assert.equal(ship.scale.value, 1.4);
    for (const style of ['shuttle', 'interceptor', 'explorer']) {
        controls.style.value = style;
        controls.style.fire('input');
        assert.equal(saved().style, style);
        assert.ok(ship.children.length > 0);
    }
    const count = ship.children.length;
    controls.markings.value = 'chevrons';
    controls.markings.fire('input');
    assert.equal(ship.children.length, count + 2);
    assert.equal(saved().body, '#abcdef');
});

test('photo skins the existing hull, saves the full image and restores selected colors when removed', () => {
    const state = setup({ style: 'shuttle' });
    const originalCount = state.ship.children.length;
    state.controls.photo.files = [{ type: 'image/png', size: 100 }];
    state.controls.photo.fire('change');
    assert.deepEqual(state.crop(), [0, 0, 400, 200, 0, 0, 256, 128]);
    assert.equal(state.saved().photo, 'data:image/png;base64,test');
    assert.equal(state.controls.preview.hidden, false);
    assert.equal(state.ship.children.length, originalCount);
    const skinned = state.ship.children.filter(child => child.material.map);
    assert.ok(skinned.length >= 2);
    assert.ok(skinned.every(child => child.geometry.uv && [...child.geometry.uv.array].every(value => value >= 0 && value <= 1)));
    assert.ok(state.ship.children.some(child => !child.material.map));
    for (const style of ['jet', 'rocket', 'saucer', 'shuttle', 'interceptor', 'explorer']) {
        state.controls.style.value = style;
        state.controls.style.fire('input');
        assert.ok(state.ship.children.filter(child => child.material.map).length >= 2);
    }
    state.controls.style.value = 'shuttle';
    state.controls.style.fire('input');
    const restored = setup(state.saved());
    assert.ok(restored.ship.children.some(child => child.material.map));
    restored.controls.remove.fire('click');
    assert.equal(restored.saved().photo, '');
    assert.equal(restored.saved().style, 'shuttle');
    assert.equal(restored.controls.preview.hidden, true);
    assert.ok(!restored.ship.children.some(child => child.material.map));
});

test('invalid images and storage failures are reported without deleting the saved photo', () => {
    const state = setup({ style: 'rocket', photo: 'data:image/png;base64,test' });
    state.controls.photo.files = [{ type: 'image/svg+xml', size: 100 }];
    state.controls.photo.fire('change');
    assert.match(state.controls.status.textContent, /Choose a PNG/);
    assert.ok(state.saved().photo);
    state.controls.photo.files = [{ type: 'image/png', size: 5 * 1024 * 1024 + 1 }];
    state.controls.photo.fire('change');
    assert.match(state.controls.status.textContent, /up to 5 MB/);
    state.failSave(true);
    state.controls.remove.fire('click');
    assert.match(state.controls.status.textContent, /Could not save/);
    assert.equal(state.errors.length, 1);
    assert.ok(state.saved().photo);
});

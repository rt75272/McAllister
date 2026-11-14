// Shared ship builder + customization panel for the Quest Map and Solar Flight pages.
(function () {
	const STORAGE_KEY = 'solarShipPrefs';
	const defaults = { style: 'jet', body: '#f8fafc', wings: '#a855f7', exhaust: '#06b6d4', size: 1, markings: 'none', photo: '' };
	const photoLimit = 5 * 1024 * 1024;
	let photoTexture = null;
	let photoRequest = 0;

	function load() {
		try {
			return { prefs: { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }, error: '' };
		} catch (error) {
			console.error('Unable to read ship preferences:', error);
			return { prefs: { ...defaults }, error: 'Could not read the saved ship. Changes may not be saved in this browser.' };
		}
	}

	function save(prefs, status) {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
			return true;
		} catch (error) {
			console.error('Unable to save ship preferences:', error);
			status.textContent = 'Could not save your ship in this browser. Changes are only for this visit; a previous photo may still be stored.';
			return false;
		}
	}

	function build(ship, prefs) {
		const skinMaterials = new Set();
		const mat = (c, skin = true) => {
			const material = new THREE.MeshStandardMaterial({
				color: new THREE.Color(skin && photoTexture ? '#ffffff' : c),
				map: skin ? photoTexture : null,
				flatShading: true
			});
			if (skin) skinMaterials.add(material);
			return material;
		};
		const glowMat = () => new THREE.MeshBasicMaterial({ color: new THREE.Color(prefs.exhaust) });
		const geometries = new Set();
		const materials = new Set();
		ship.children.slice().forEach((child) => {
			ship.remove(child);
			geometries.add(child.geometry);
			materials.add(child.material);
		});
		geometries.forEach((geometry) => geometry.dispose());
		materials.forEach((material) => material.dispose());

		if (prefs.style === 'saucer') {
			const disc = new THREE.Mesh(new THREE.CylinderGeometry(.9, .9, .18, 20), mat(prefs.body));
			const dome = new THREE.Mesh(new THREE.SphereGeometry(.4, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat(prefs.wings));
			dome.position.y = .09;
			const glow = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .08, 12), glowMat());
			glow.position.y = -.12;
			ship.add(disc, dome, glow);
		} else if (prefs.style === 'shuttle' || prefs.style === 'interceptor' || prefs.style === 'explorer') {
			const shuttle = prefs.style === 'shuttle';
			const interceptor = prefs.style === 'interceptor';
			const hull = new THREE.Mesh(
				shuttle ? new THREE.BoxGeometry(.65, .35, 1.65) : new THREE.ConeGeometry(interceptor ? .36 : .48, 1.65, interceptor ? 4 : 8),
				mat(prefs.body)
			);
			if (!shuttle) hull.rotation.x = -Math.PI / 2;
			ship.add(hull);
			if (shuttle) {
				const nose = new THREE.Mesh(new THREE.ConeGeometry(.46, .55, 4), mat(prefs.body));
				nose.rotation.set(-Math.PI / 2, Math.PI / 4, 0);
				nose.position.z = -1.08;
				ship.add(nose);
			}
			const wings = new THREE.Mesh(new THREE.BoxGeometry(interceptor ? 2.2 : 1.8, .08, shuttle ? .7 : .45), mat(prefs.wings));
			wings.position.set(0, -.12, .25);
			ship.add(wings);
			if (interceptor) wings.rotation.y = .15;
			const cockpit = new THREE.Mesh(new THREE.SphereGeometry(.24, 12, 8), mat(prefs.wings));
			cockpit.scale.set(1, .6, 1.5);
			cockpit.position.set(0, .23, -.28);
			ship.add(cockpit);
			for (const x of [-.42, .42]) {
				const engine = new THREE.Mesh(new THREE.CylinderGeometry(.12, .08, .35, 8), glowMat());
				engine.rotation.x = Math.PI / 2;
				engine.position.set(x, -.08, .8);
				ship.add(engine);
			}
		} else {
			const rocket = prefs.style === 'rocket';
			const fuselage = new THREE.Mesh(rocket ? new THREE.CylinderGeometry(.3, .3, 1.5, 10) : new THREE.ConeGeometry(.4, 1.5, 5), mat(prefs.body));
			fuselage.rotation.x = Math.PI / 2;
			ship.add(fuselage);
			if (rocket) {
				const nose = new THREE.Mesh(new THREE.ConeGeometry(.3, .5, 10), mat(prefs.wings));
				nose.rotation.x = -Math.PI / 2;
				nose.position.z = -1;
				ship.add(nose);
			}
			const wingX = rocket ? .45 : .5;
			const left = new THREE.Mesh(new THREE.BoxGeometry(rocket ? .5 : .8, .05, .5), mat(prefs.wings));
			left.position.set(-wingX, -.1, .2);
			left.rotation.y = .2;
			const right = left.clone();
			right.position.x = wingX;
			right.rotation.y = -.2;
			const flame = new THREE.Mesh(new THREE.CylinderGeometry(.2, .05, .3, 4), glowMat());
			flame.position.set(0, 0, rocket ? .9 : .7);
			flame.rotation.x = Math.PI / 2;
			ship.add(left, right, flame);
		}

		if (prefs.markings !== 'none') {
			const markingMaterial = mat(prefs.exhaust, false);
			for (const x of [-.55, .55]) {
				const marking = new THREE.Mesh(new THREE.BoxGeometry(.18, .04, prefs.markings === 'stripes' ? .5 : .26), markingMaterial);
				marking.position.set(x, prefs.style === 'saucer' ? .12 : -.055, .2);
				if (prefs.markings === 'chevrons') marking.rotation.y = x < 0 ? -.65 : .65;
				ship.add(marking);
			}
		}
		if (photoTexture) {
			const surfaces = ship.children.filter((child) => skinMaterials.has(child.material));
			const originalGeometries = new Set();
			const point = new THREE.Vector3();
			let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
			surfaces.forEach((mesh) => {
				originalGeometries.add(mesh.geometry);
				mesh.geometry = mesh.geometry.clone();
				mesh.updateMatrix();
				const positions = mesh.geometry.getAttribute('position');
				for (let i = 0; i < positions.count; i++) {
					point.fromBufferAttribute(positions, i).applyMatrix4(mesh.matrix);
					minX = Math.min(minX, point.x);
					maxX = Math.max(maxX, point.x);
					minZ = Math.min(minZ, point.z);
					maxZ = Math.max(maxZ, point.z);
				}
			});
			originalGeometries.forEach((geometry) => geometry.dispose());
			// Project one image across all hull pieces in ship space, including rotated wings.
			surfaces.forEach((mesh) => {
				const positions = mesh.geometry.getAttribute('position');
				const uvs = new Float32Array(positions.count * 2);
				for (let i = 0; i < positions.count; i++) {
					point.fromBufferAttribute(positions, i).applyMatrix4(mesh.matrix);
					uvs[i * 2] = (point.x - minX) / (maxX - minX);
					uvs[i * 2 + 1] = 1 - (point.z - minZ) / (maxZ - minZ);
				}
				mesh.geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
			});
		}
		ship.scale.setScalar(prefs.size);
	}

	function injectUI(onChange, prefs, initialError, onPhoto, onRemove) {
		const style = document.createElement('style');
		style.textContent = '#ship-custom{position:fixed;left:50%;top:0;transform:translateX(-50%);z-index:60;width:min(260px,calc(100vw - 20px));font:700 12px sans-serif;pointer-events:auto}'
			+ '#ship-custom .sc-toggle{width:auto;display:block;margin:0 auto;padding:2px 12px;font-size:11px;line-height:14px;border-radius:0 0 6px 6px;border-top:0}#ship-custom button{width:100%;margin:0;padding:8px 10px;color:#eef8ff;background:rgba(3,13,31,.92);border:1px solid rgba(125,211,252,.5);border-radius:6px;font:inherit;cursor:pointer}'
			+ '#ship-custom .sc-fields{display:none;box-sizing:border-box;margin-top:4px;padding:10px;gap:8px;max-height:calc(100vh - 100px);overflow-y:auto;background:rgba(3,13,31,.97);border:1px solid rgba(125,211,252,.5);border-radius:6px;color:#d9e8f8}'
			+ '#ship-custom.open .sc-fields{display:grid}'
			+ '#ship-custom label{display:flex;justify-content:space-between;align-items:center;gap:8px;color:#d9e8f8}'
			+ '#ship-custom input,#ship-custom select{width:115px;max-width:100%;margin:0;color:#102238;background:#fff}'
			+ '#ship-custom input[type=color]{height:24px;padding:0;border:0;background:none}'
			+ '#ship-custom input[type=range]{height:24px;min-height:0;padding:0;border:0;background:transparent}'
			+ '#ship-custom .sc-photo-label{display:block}#ship-custom input[type=file]{display:block;width:100%;margin-top:5px;font:inherit}'
			+ '#ship-custom .sc-preview{width:64px;height:64px;object-fit:cover;border:2px solid #d9e8f8;border-radius:6px}#ship-custom .sc-preview[hidden]{display:none}'
			+ '#ship-custom .sc-note,#ship-custom .sc-status{margin:0;color:#d9e8f8;line-height:1.4}#ship-custom .sc-status:not(:empty){padding:6px;border-left:3px solid #67e8f9}'
			+ '#ship-custom :focus-visible{outline:2px solid #67e8f9;outline-offset:2px}';
		document.head.appendChild(style);

		const panel = document.createElement('div');
		panel.id = 'ship-custom';
		panel.innerHTML = '<button type="button" class="sc-toggle" aria-expanded="false" aria-controls="ship-custom-fields">🚀 Customize Ship</button><div class="sc-fields" id="ship-custom-fields">'
			+ '<label>Style<select data-k="style"><option value="jet">Jet</option><option value="rocket">Rocket</option><option value="saucer">Saucer</option><option value="shuttle">Shuttle</option><option value="interceptor">Interceptor</option><option value="explorer">Explorer</option></select></label>'
			+ '<label>Body<input data-k="body" type="color"></label>'
			+ '<label>Wings / accent<input data-k="wings" type="color"></label>'
			+ '<label>Exhaust glow<input data-k="exhaust" type="color"></label>'
			+ '<label>Markings<select data-k="markings"><option value="none">None</option><option value="stripes">Stripes</option><option value="chevrons">Chevrons</option></select></label>'
			+ '<label>Size<input data-k="size" type="range" min=".6" max="2.5" step=".1"></label>'
			+ '<label class="sc-photo-label">Photo skin (PNG, JPEG or WebP; up to 5 MB)<input class="sc-photo" type="file" accept="image/png,image/jpeg,image/webp"></label>'
			+ '<p class="sc-note">Your photo covers the hull and wings instead of their colors. It stays only in this browser, not uploaded. Avoid private photos on shared devices.</p>'
			+ '<img class="sc-preview" alt="Photo skin preview" hidden>'
			+ '<button type="button" class="sc-remove">Remove photo</button>'
			+ '<button type="button" class="sc-reset">Reset ship and photo</button><p class="sc-status" role="status" aria-live="polite"></p></div>';
		document.body.appendChild(panel);

		const status = panel.querySelector('.sc-status');
		status.textContent = initialError;
		const inputs = panel.querySelectorAll('[data-k]');
		const sync = () => inputs.forEach((el) => { el.value = prefs[el.dataset.k]; });
		sync();
		inputs.forEach((el) => el.addEventListener('input', () => {
			prefs[el.dataset.k] = el.dataset.k === 'size' ? parseFloat(el.value) : el.value;
			onChange(status);
		}));
		['keydown', 'keyup', 'click'].forEach((type) => panel.addEventListener(type, (event) => event.stopPropagation()));
		panel.querySelector('.sc-toggle').addEventListener('click', (event) => {
			const open = panel.classList.toggle('open');
			event.currentTarget.setAttribute('aria-expanded', String(open));
		});
		const photoInput = panel.querySelector('.sc-photo');
		photoInput.addEventListener('change', () => {
			if (photoInput.files.length) onPhoto(photoInput.files[0], status);
			photoInput.value = '';
		});
		panel.querySelector('.sc-remove').addEventListener('click', () => onRemove(status));
		panel.querySelector('.sc-reset').addEventListener('click', () => {
			Object.assign(prefs, defaults);
			sync();
			onRemove(status, 'Ship and photo reset.');
		});
		return { status, preview: panel.querySelector('.sc-preview') };
	}

	window.initShipCustomizer = function (ship) {
		const { prefs, error } = load();
		const apply = (status, message = '') => {
			build(ship, prefs);
			if (save(prefs, status)) status.textContent = message;
		};
		const removePhoto = (status, message = 'Photo removed from this ship.') => {
			photoRequest++;
			if (photoTexture) photoTexture.dispose();
			photoTexture = null;
			prefs.photo = '';
			preview.hidden = true;
			preview.removeAttribute('src');
			apply(status, message);
		};
		const uploadPhoto = (file, status) => {
			const request = ++photoRequest;
			if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > photoLimit || file.size === 0) {
				status.textContent = 'Choose a PNG, JPEG or WebP image up to 5 MB.';
				return;
			}
			status.textContent = 'Preparing photo…';
			const reader = new FileReader();
			reader.onerror = () => { if (request === photoRequest) status.textContent = 'Could not read that photo. Try another image.'; };
			reader.onload = () => {
				const image = new Image();
				image.onerror = () => { if (request === photoRequest) status.textContent = 'Could not open that photo. Try another image.'; };
				image.onload = () => {
					if (request !== photoRequest) return;
					if (!image.width || !image.height || image.width * image.height > 24000000) {
						status.textContent = 'That photo is too large to process. Choose an image under 24 megapixels.';
						return;
					}
					const canvas = document.createElement('canvas');
					const scale = 256 / Math.max(image.width, image.height);
					canvas.width = Math.max(1, Math.round(image.width * scale));
					canvas.height = Math.max(1, Math.round(image.height * scale));
					const context = canvas.getContext('2d');
					if (!context) {
						status.textContent = 'This browser could not prepare the photo.';
						return;
					}
					context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
					let data;
					try {
						data = canvas.toDataURL('image/png');
					} catch (error) {
						console.error('Unable to prepare ship photo:', error);
						status.textContent = 'This browser could not prepare the photo. Try another image.';
						return;
					}
					const texture = new THREE.CanvasTexture(canvas);
					texture.encoding = THREE.sRGBEncoding;
					texture.generateMipmaps = false;
					texture.minFilter = THREE.LinearFilter;
					if (photoTexture) photoTexture.dispose();
					photoTexture = texture;
					prefs.photo = data;
					preview.src = data;
					preview.hidden = false;
					apply(status, 'Photo added to your ship and saved in this browser.');
				};
				image.src = reader.result;
			};
			reader.readAsDataURL(file);
		};
		build(ship, prefs);
		const { status, preview } = injectUI(apply, prefs, error, uploadPhoto, removePhoto);
		if (prefs.photo) {
			if (typeof prefs.photo !== 'string' || !prefs.photo.startsWith('data:image/png;base64,') || prefs.photo.length > 500000) {
				status.textContent = 'The saved photo could not be read. Remove it or choose another photo.';
				return;
			}
			const request = ++photoRequest;
			const image = new Image();
			image.onload = () => {
				if (request !== photoRequest) return;
				photoTexture = new THREE.Texture(image);
				photoTexture.encoding = THREE.sRGBEncoding;
				photoTexture.generateMipmaps = false;
				photoTexture.minFilter = THREE.LinearFilter;
				photoTexture.needsUpdate = true;
				preview.src = prefs.photo;
				preview.hidden = false;
				build(ship, prefs);
			};
			image.onerror = () => {
				if (request === photoRequest) status.textContent = 'The saved photo could not be read. Remove it or choose another photo.';
			};
			image.src = prefs.photo;
		}
	};
})();

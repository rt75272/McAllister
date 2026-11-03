// Shared ship builder + customization panel for the Quest Map and Solar Flight pages.
(function () {
	const STORAGE_KEY = 'solarShipPrefs';
	const defaults = { style: 'jet', body: '#f8fafc', wings: '#a855f7', exhaust: '#06b6d4', size: 1 };

	function load() {
		try { return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; } catch (e) { return { ...defaults }; }
	}
	function save(prefs) {
		try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch (e) {}
	}

	function build(ship, prefs) {
		const mat = (c) => new THREE.MeshStandardMaterial({ color: new THREE.Color(c), flatShading: true });
		const glowMat = () => new THREE.MeshBasicMaterial({ color: new THREE.Color(prefs.exhaust) });
		ship.children.slice().forEach((c) => { ship.remove(c); c.geometry.dispose(); c.material.dispose(); });
		if (prefs.style === 'saucer') {
			const disc = new THREE.Mesh(new THREE.CylinderGeometry(.9, .9, .18, 20), mat(prefs.body));
			const dome = new THREE.Mesh(new THREE.SphereGeometry(.4, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat(prefs.wings));
			dome.position.y = .09;
			const glow = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .08, 12), glowMat());
			glow.position.y = -.12;
			ship.add(disc, dome, glow);
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
		ship.scale.setScalar(prefs.size);
	}

	function injectUI(onChange, prefs) {
		const style = document.createElement('style');
		style.textContent = '#ship-custom{position:fixed;left:50%;top:0;transform:translateX(-50%);z-index:60;width:210px;font:700 12px sans-serif;pointer-events:auto}'
			+ '#ship-custom .sc-toggle{width:auto;display:block;margin:0 auto;padding:2px 12px;font-size:11px;line-height:14px;border-radius:0 0 6px 6px;border-top:0}#ship-custom button{width:100%;margin:0;padding:8px 10px;color:#eef8ff;background:rgba(3,13,31,.92);border:1px solid rgba(125,211,252,.5);border-radius:6px;font:inherit;cursor:pointer}'
			+ '#ship-custom .sc-fields{display:none;margin-top:4px;padding:10px;gap:8px;background:rgba(3,13,31,.95);border:1px solid rgba(125,211,252,.5);border-radius:6px;color:#a8b9d4}'
			+ '#ship-custom.open .sc-fields{display:grid}'
			+ '#ship-custom label{display:flex;justify-content:space-between;align-items:center;gap:8px;color:#a8b9d4}'
			+ '#ship-custom input,#ship-custom select{width:95px;margin:0}'
			+ '#ship-custom input[type=color]{height:24px;padding:0;border:0;background:none}';
		document.head.appendChild(style);

		const panel = document.createElement('div');
		panel.id = 'ship-custom';
		panel.innerHTML = '<button type="button" class="sc-toggle" >🚀 Customize Ship</button><div class="sc-fields">'
			+ '<label>Style<select data-k="style"><option value="jet">Jet</option><option value="rocket">Rocket</option><option value="saucer">Saucer</option></select></label>'
			+ '<label>Body<input data-k="body" type="color"></label>'
			+ '<label>Wings / accent<input data-k="wings" type="color"></label>'
			+ '<label>Exhaust glow<input data-k="exhaust" type="color"></label>'
			+ '<label>Size<input data-k="size" type="range" min=".6" max="2.5" step=".1"></label>'
			+ '<button type="button" class="sc-reset">Reset</button></div>';
		document.body.appendChild(panel);

		const inputs = panel.querySelectorAll('[data-k]');
		const sync = () => inputs.forEach((el) => { el.value = prefs[el.dataset.k]; });
		sync();
		inputs.forEach((el) => {
			el.addEventListener('input', () => {
				prefs[el.dataset.k] = el.dataset.k === 'size' ? parseFloat(el.value) : el.value;
				onChange();
			});
			// Keep typing/arrow keys in the panel from steering the ship.
			['keydown', 'keyup'].forEach((t) => el.addEventListener(t, (e) => e.stopPropagation()));
		});
		panel.querySelector('.sc-toggle').addEventListener('click', (e) => { panel.classList.toggle('open'); e.currentTarget.blur(); });
		panel.querySelector('.sc-reset').addEventListener('click', (e) => {
			Object.assign(prefs, defaults);
			sync();
			onChange();
			e.currentTarget.blur();
		});
	}

	window.initShipCustomizer = function (ship) {
		const prefs = load();
		const apply = () => { build(ship, prefs); save(prefs); };
		build(ship, prefs);
		injectUI(apply, prefs);
	};
})();

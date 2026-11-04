(() => {
    'use strict';

    const canvas = document.getElementById('town-canvas');
    if (!canvas) return;

    const context = canvas.getContext('2d');
    const status = document.getElementById('town-status');
    const paletteButtons = Array.from(document.querySelectorAll('.palette-item'));
    const coordinateRows = document.getElementById('coordinate-rows');
    const selectedCoordinate = document.getElementById('selected-coordinate');
    const deleteSelectedButton = document.getElementById('delete-selected');
    const modeButtons = Array.from(document.querySelectorAll('.mode-button'));
    const mapStyleSelect = document.getElementById('map-style');
    const gridStepSelect = document.getElementById('grid-step');
    const studentNameInput = document.getElementById('student-name');
    const items = [];

    if (!context) {
        status.textContent = 'Your browser could not start the town map canvas.';
        document.getElementById('export-town').disabled = true;
        return;
    }

    const settings = {
        mode: 'four',
        gridStep: 1,
        mapStyle: 'suburban',
        selectedPalette: null,
        selectedItemId: null,
        draggedItemId: null,
        nextItemId: 1
    };

    function boundsForMode(mode = settings.mode) {
        return mode === 'quadrant1' ? { min: 0, max: 10 } : { min: -8, max: 8 };
    }

    function getGeometry(width, height, mode = settings.mode) {
        const bounds = boundsForMode(mode);
        const leftMargin = 72;
        const rightMargin = 24;
        const topMargin = 24;
        const bottomMargin = 62;
        const availableWidth = width - leftMargin - rightMargin;
        const availableHeight = height - topMargin - bottomMargin;
        const plotSize = Math.min(availableWidth, availableHeight);
        return {
            ...bounds,
            left: leftMargin + (availableWidth - plotSize) / 2,
            top: topMargin + (availableHeight - plotSize) / 2,
            size: plotSize
        };
    }

    function coordinateToPixel(x, y, geometry) {
        const cellSize = geometry.size / (geometry.max - geometry.min);
        return {
            x: geometry.left + (x - geometry.min) * cellSize,
            y: geometry.top + (geometry.max - y) * cellSize
        };
    }

    function pixelToCoordinate(pixelX, pixelY, geometry) {
        const cellSize = geometry.size / (geometry.max - geometry.min);
        const x = Math.round((geometry.min + (pixelX - geometry.left) / cellSize) / settings.gridStep) * settings.gridStep;
        const y = Math.round((geometry.max - (pixelY - geometry.top) / cellSize) / settings.gridStep) * settings.gridStep;
        return {
            x: Math.max(geometry.min, Math.min(geometry.max, x)),
            y: Math.max(geometry.min, Math.min(geometry.max, y))
        };
    }

    function drawRoad(ctx, points, width, dashed = false) {
        ctx.save();
        ctx.beginPath();
        points.forEach(([x, y], index) => {
            if (index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#64748b';
        ctx.stroke();
        ctx.lineWidth = Math.max(1, width * .09);
        ctx.strokeStyle = '#e2e8f0';
        ctx.setLineDash(dashed ? [8, 8] : []);
        ctx.stroke();
        ctx.restore();
    }

    function drawMapBackground(ctx, geometry, style) {
        const { left, top, size } = geometry;
        const point = ([x, y]) => [left + size * x, top + size * y];
        const organicPatch = (x, y, width, height, color) => {
            const px = left + size * x;
            const py = top + size * y;
            const patchWidth = size * width;
            const patchHeight = size * height;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(px + patchWidth * .18, py + patchHeight * .06);
            ctx.bezierCurveTo(
                px + patchWidth * .55, py - patchHeight * .04,
                px + patchWidth * 1.05, py + patchHeight * .12,
                px + patchWidth * .91, py + patchHeight * .43
            );
            ctx.bezierCurveTo(
                px + patchWidth * 1.04, py + patchHeight * .82,
                px + patchWidth * .67, py + patchHeight * 1.05,
                px + patchWidth * .39, py + patchHeight * .88
            );
            ctx.bezierCurveTo(
                px + patchWidth * .06, py + patchHeight * 1.02,
                px - patchWidth * .08, py + patchHeight * .64,
                px + patchWidth * .09, py + patchHeight * .39
            );
            ctx.bezierCurveTo(
                px - patchWidth * .03, py + patchHeight * .2,
                px + patchWidth * .02, py + patchHeight * .09,
                px + patchWidth * .18, py + patchHeight * .06
            );
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            ctx.restore();
        };
        const pond = (x, y, radiusX, radiusY, rotation = 0) => {
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(
                left + size * x, top + size * y,
                size * radiusX, size * radiusY, rotation, 0, Math.PI * 2
            );
            ctx.fillStyle = '#a4d4f2';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,.9)';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.restore();
        };
        const road = (points, width = .025) => {
            drawRoad(ctx, points.map(point), size * width, true);
        };
        const styledPath = (drawPath, width = .025) => {
            ctx.save();
            ctx.beginPath();
            drawPath();
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = size * width;
            ctx.strokeStyle = '#64748b';
            ctx.stroke();
            ctx.lineWidth = Math.max(2, size * width * .1);
            ctx.strokeStyle = '#e2e8f0';
            ctx.setLineDash([size * .012, size * .012]);
            ctx.stroke();
            ctx.restore();
        };

        ctx.save();
        ctx.beginPath();
        ctx.rect(left, top, size, size);
        ctx.clip();

        // Layer 1: the map starts with a continuous grassy base.
        ctx.fillStyle = '#d8ebd4';
        ctx.fillRect(left, top, size, size);

        // Layer 2: terrain features are placed before infrastructure.
        if (style === 'suburban') {
            organicPatch(.78, .06, .16, .12, '#f6ebc9');
            organicPatch(.05, .78, .2, .14, '#f6ebc9');
            pond(.86, .13, .055, .04, -.2);
        } else if (style === 'river-city') {
            organicPatch(.27, .02, .13, .96, '#f6ebc9');
            organicPatch(.60, .02, .13, .96, '#f6ebc9');
        } else if (style === 'lakeside') {
            pond(.27, .5, .22, .34, -.08);
            organicPatch(.035, .12, .13, .18, '#f6ebc9');
            organicPatch(.035, .69, .15, .18, '#f6ebc9');
        } else if (style === 'downtown') {
            ctx.fillStyle = '#b7d9a8';
            ctx.fillRect(left + size * .37, top + size * .37, size * .26, size * .26);
            pond(.5, .5, .055, .04, -.18);
        }

        // Layer 3: rivers, paths, bridges, and paved roads sit over terrain features.
        if (style === 'suburban') {
            styledPath(() => {
                ctx.ellipse(left + size * .5, top + size * .5, size * .39, size * .37, 0, 0, Math.PI * 2);
            }, .03);
            road([[.5, .13], [.5, .29]], .03);
            styledPath(() => {
                ctx.arc(left + size * .5, top + size * .38, size * .095, 0, Math.PI * 2);
            }, .03);
        } else if (style === 'river-city') {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(left + size * .42, top);
            ctx.bezierCurveTo(left + size * .39, top + size * .28, left + size * .46, top + size * .34, left + size * .42, top + size * .52);
            ctx.bezierCurveTo(left + size * .39, top + size * .72, left + size * .46, top + size * .82, left + size * .42, top + size);
            ctx.lineTo(left + size * .62, top + size);
            ctx.bezierCurveTo(left + size * .66, top + size * .78, left + size * .59, top + size * .68, left + size * .62, top + size * .49);
            ctx.bezierCurveTo(left + size * .65, top + size * .3, left + size * .58, top + size * .2, left + size * .62, top);
            ctx.closePath();
            ctx.fillStyle = '#7dd3fc';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,.75)';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.restore();
            // These edge-to-edge roads form the two bridges over the river.
            road([[0, .32], [1, .32]], .04);
            road([[0, .69], [1, .69]], .04);
        } else if (style === 'lakeside') {
            styledPath(() => {
                ctx.ellipse(left + size * .27, top + size * .5, size * .29, size * .42, -.08, 0, Math.PI * 2);
            }, .03);
            road([[.54, .08], [.92, .08], [.92, .92], [.54, .92]], .025);
        } else if (style === 'downtown') {
            for (const fraction of [.28, .72]) {
                road([[fraction, 0], [fraction, 1]], .028);
                road([[0, fraction], [1, fraction]], .028);
            }
            road([[.38, .46], [.445, .46]], .018);
            road([[.555, .54], [.62, .54]], .018);
            road([[.46, .38], [.46, .445]], .018);
            road([[.54, .555], [.54, .62]], .018);
        }

        ctx.restore();
    }

    function drawCoordinateGrid(ctx, geometry) {
        const { left, top, size, min, max } = geometry;
        const cellSize = size / (max - min);
        const subdivisions = Math.round(1 / settings.gridStep);
        const totalSteps = (max - min) * subdivisions;
        const stepSize = cellSize / subdivisions;
        ctx.save();
        for (let index = 0; index <= totalSteps; index += 1) {
            const isMajor = index % subdivisions === 0;
            const x = left + index * stepSize;
            const y = top + size - index * stepSize;
            ctx.strokeStyle = isMajor ? 'rgba(51, 65, 85, .42)' : 'rgba(51, 65, 85, .24)';
            ctx.lineWidth = isMajor ? 1 : .75;
            ctx.beginPath();
            ctx.moveTo(x, top);
            ctx.lineTo(x, top + size);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(left, y);
            ctx.lineTo(left + size, y);
            ctx.stroke();
        }

        const origin = coordinateToPixel(0, 0, geometry);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(left, origin.y);
        ctx.lineTo(left + size, origin.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(origin.x, top);
        ctx.lineTo(origin.x, top + size);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(left, origin.y);
        ctx.lineTo(left + size, origin.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(origin.x, top);
        ctx.lineTo(origin.x, top + size);
        ctx.stroke();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(left, origin.y);
        ctx.lineTo(left + size, origin.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(origin.x, top);
        ctx.lineTo(origin.x, top + size);
        ctx.stroke();

        const tickHalfLength = 5;
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        for (let index = 0; index <= totalSteps; index += 1) {
            const value = min + index * settings.gridStep;
            const xPoint = coordinateToPixel(value, 0, geometry);
            ctx.beginPath();
            ctx.moveTo(xPoint.x, origin.y - (index % subdivisions === 0 ? tickHalfLength : tickHalfLength * .65));
            ctx.lineTo(xPoint.x, origin.y + (index % subdivisions === 0 ? tickHalfLength : tickHalfLength * .65));
            ctx.stroke();
            const yPoint = coordinateToPixel(0, value, geometry);
            ctx.beginPath();
            ctx.moveTo(origin.x - (index % subdivisions === 0 ? tickHalfLength : tickHalfLength * .65), yPoint.y);
            ctx.lineTo(origin.x + (index % subdivisions === 0 ? tickHalfLength : tickHalfLength * .65), yPoint.y);
            ctx.stroke();
        }

        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(255,255,255,.95)';
        ctx.fillStyle = '#0f172a';
        ctx.textBaseline = 'top';
        ctx.textAlign = 'center';
        for (let index = 0; index <= totalSteps; index += 1) {
            const value = min + index * settings.gridStep;
            if (value === 0) continue;
            const point = coordinateToPixel(value, 0, geometry);
            const isMajor = index % subdivisions === 0;
            const labelX = point.x;
            const labelY = origin.y + 8;
            const label = Number.isInteger(value) ? String(value) : value.toFixed(1);
            ctx.font = `${isMajor ? 'bold 12px' : '10px'} Lexend, Arial, sans-serif`;
            ctx.strokeText(label, labelX, labelY);
            ctx.fillText(label, labelX, labelY);
        }
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let index = 0; index <= totalSteps; index += 1) {
            const value = min + index * settings.gridStep;
            if (value === 0) continue;
            const point = coordinateToPixel(0, value, geometry);
            const labelX = origin.x - 8;
            const label = Number.isInteger(value) ? String(value) : value.toFixed(1);
            const isMajor = index % subdivisions === 0;
            ctx.font = `${isMajor ? 'bold 12px' : '10px'} Lexend, Arial, sans-serif`;
            ctx.strokeText(label, labelX, point.y);
            ctx.fillText(label, labelX, point.y);
        }

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(origin.x, origin.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = 'bold 12px Lexend, Arial, sans-serif';
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(255,255,255,.95)';
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.strokeText('0', origin.x + 8, origin.y - 4);
        ctx.fillText('0', origin.x + 8, origin.y - 4);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.font = 'bold 14px Lexend, Arial, sans-serif';
        ctx.fillText('X', left + size, top + size + 43);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('Y', left - 36, top - 4);
        ctx.restore();
    }

    function drawItems(ctx, geometry, sourceItems = items, selectedId = settings.selectedItemId) {
        sourceItems.forEach((item) => {
            const point = coordinateToPixel(item.x, item.y, geometry);
            ctx.save();
            if (item.id === selectedId) {
                ctx.beginPath();
                ctx.arc(point.x, point.y - 5, 23, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(251, 191, 36, .34)';
                ctx.fill();
                ctx.strokeStyle = '#b45309';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            ctx.font = '26px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.translate(point.x, point.y - 5);
            ctx.rotate((item.rotation || 0) * Math.PI / 180);
            ctx.fillText(item.icon, 0, 0);
            ctx.restore();
        });
    }

    function renderMap(ctx, width, height, offsetX = 0, offsetY = 0, sourceItems = items, selectedId = settings.selectedItemId) {
        const geometry = getGeometry(width, height);
        geometry.left += offsetX;
        geometry.top += offsetY;
        ctx.save();
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(offsetX, offsetY, width, height);
        drawMapBackground(ctx, geometry, settings.mapStyle);
        drawCoordinateGrid(ctx, geometry);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 3;
        ctx.strokeRect(geometry.left, geometry.top, geometry.size, geometry.size);
        drawItems(ctx, geometry, sourceItems, selectedId);
        ctx.restore();
        return geometry;
    }

    function render() {
        renderMap(context, canvas.width, canvas.height);
    }

    function activeItem() {
        return items.find((item) => item.id === settings.selectedItemId) || null;
    }

    function selectItem(itemId) {
        settings.selectedItemId = itemId;
        settings.selectedPalette = null;
        paletteButtons.forEach((button) => button.setAttribute('aria-pressed', 'false'));
        const item = activeItem();
        selectedCoordinate.textContent = item
            ? `Selected: ${item.icon} ${item.name}`
            : 'Selected item: none';
        deleteSelectedButton.disabled = !item;
        render();
        renderTable();
    }

    function renderTable() {
        coordinateRows.replaceChildren();
        document.getElementById('empty-town').hidden = items.length > 0;
        items.forEach((item) => {
            const row = document.createElement('tr');
            row.dataset.selected = String(item.id === settings.selectedItemId);
            const nameCell = document.createElement('td');
            const preview = document.createElement('span');
            preview.className = 'coordinate-icon-preview';
            preview.setAttribute('aria-hidden', 'true');
            preview.textContent = item.icon;
            const name = document.createElement('span');
            name.textContent = item.name;
            nameCell.append(preview, document.createTextNode(' '), name);
            const coordinateCell = document.createElement('td');
            const answerInput = document.createElement('input');
            answerInput.type = 'text';
            answerInput.className = 'coordinate-answer';
            answerInput.name = `coordinate-answer-${item.id}`;
            answerInput.autocomplete = 'off';
            answerInput.inputMode = 'text';
            answerInput.spellcheck = false;
            answerInput.setAttribute('aria-label', `Write the ordered pair for ${item.name}`);
            answerInput.placeholder = '(x, y)';
            answerInput.value = item.answer || '';
            answerInput.addEventListener('input', () => { item.answer = answerInput.value; });
            answerInput.addEventListener('change', () => applyOrderedPair(item, answerInput));
            answerInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    applyOrderedPair(item, answerInput);
                }
            });
            coordinateCell.append(answerInput);
            const actionCell = document.createElement('td');
            const removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.className = 'table-delete';
            removeButton.textContent = 'Delete';
            removeButton.setAttribute('aria-label', `Delete ${item.name}`);
            removeButton.addEventListener('click', () => removeItem(item.id));
            actionCell.append(removeButton);
            row.addEventListener('click', (event) => {
                if (event.target === removeButton || event.target === answerInput) return;
                if (item.id !== settings.selectedItemId) selectItem(item.id);
            });
            row.append(nameCell, coordinateCell, actionCell);
            coordinateRows.append(row);
        });
    }

    function applyOrderedPair(item, input) {
        const match = input.value.trim().match(/^\(?\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*\)?$/);
        if (!match) {
            status.textContent = 'Enter an ordered pair like (3, 4).';
            return;
        }
        const x = parseFloat(match[1]);
        const y = parseFloat(match[2]);
        const bounds = boundsForMode();
        if (x < bounds.min || x > bounds.max || y < bounds.min || y > bounds.max) {
            status.textContent = `Both numbers must be between ${bounds.min} and ${bounds.max}.`;
            return;
        }
        item.x = x;
        item.y = y;
        item.answer = input.value;
        settings.selectedItemId = item.id;
        selectedCoordinate.textContent = `Selected: ${item.icon} ${item.name}`;
        deleteSelectedButton.disabled = false;
        Array.from(coordinateRows.children).forEach((row, index) => {
            row.dataset.selected = String(items[index] === item);
        });
        render();
        status.textContent = `${item.icon} ${item.name} moved to (${x}, ${y}).`;
    }

    function setPaletteItem(itemName, icon, rotation = 0) {
        settings.selectedPalette = itemName ? { name: itemName, icon, rotation } : null;
        settings.selectedItemId = null;
        paletteButtons.forEach((button) => {
            button.setAttribute('aria-pressed', String(button.dataset.item === itemName));
        });
        selectedCoordinate.textContent = settings.selectedPalette
            ? `Ready to place: ${icon} ${itemName}`
            : 'Selected item: none';
        deleteSelectedButton.disabled = true;
        render();
        renderTable();
    }

    function addItem(itemName, icon, x, y, rotation = 0) {
        const item = { id: settings.nextItemId++, name: itemName, icon, x, y, rotation };
        items.push(item);
        settings.selectedPalette = null;
        paletteButtons.forEach((button) => button.setAttribute('aria-pressed', 'false'));
        selectItem(item.id);
        status.textContent = `${item.icon} ${item.name} placed on the map. Read its location from the grid and record the ordered pair.`;
    }

    function removeItem(itemId) {
        const index = items.findIndex((item) => item.id === itemId);
        if (index < 0) return;
        const [item] = items.splice(index, 1);
        if (settings.selectedItemId === itemId) settings.selectedItemId = null;
        selectItem(settings.selectedItemId);
        status.textContent = `${item.name} removed from the town.`;
    }

    function getCanvasPoint(event) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) * canvas.width / rect.width,
            y: (event.clientY - rect.top) * canvas.height / rect.height
        };
    }

    function findItemAt(point) {
        const geometry = getGeometry(canvas.width, canvas.height);
        for (let index = items.length - 1; index >= 0; index -= 1) {
            const itemPoint = coordinateToPixel(items[index].x, items[index].y, geometry);
            if (Math.hypot(point.x - itemPoint.x, point.y - (itemPoint.y - 5)) <= 24) {
                return items[index];
            }
        }
        return null;
    }

    function placeAtCanvasPoint(point, itemData = settings.selectedPalette) {
        if (!itemData) {
            status.textContent = 'Choose a sticker from the palette, then place it on the map.';
            return;
        }
        const geometry = getGeometry(canvas.width, canvas.height);
        const position = pixelToCoordinate(point.x, point.y, geometry);
        addItem(itemData.name, itemData.icon, position.x, position.y, itemData.rotation);
    }

    function snapItemsToGrid() {
        const bounds = boundsForMode();
        items.forEach((item) => {
            item.x = Math.max(bounds.min, Math.min(bounds.max, Math.round(item.x / settings.gridStep) * settings.gridStep));
            item.y = Math.max(bounds.min, Math.min(bounds.max, Math.round(item.y / settings.gridStep) * settings.gridStep));
        });
    }

    paletteButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const alreadySelected = settings.selectedPalette && settings.selectedPalette.name === button.dataset.item;
            setPaletteItem(
                alreadySelected ? null : button.dataset.item,
                button.dataset.icon,
                Number(button.dataset.rotation || 0)
            );
            status.textContent = alreadySelected
                ? 'Sticker selection cleared.'
                : `${button.dataset.item} selected. Click the map or drag the sticker onto it.`;
        });
        button.addEventListener('dragstart', (event) => {
            const data = {
                name: button.dataset.item,
                icon: button.dataset.icon,
                rotation: Number(button.dataset.rotation || 0)
            };
            event.dataTransfer.setData('application/x-town-item', JSON.stringify(data));
            event.dataTransfer.effectAllowed = 'copy';
            setPaletteItem(data.name, data.icon, data.rotation);
        });
    });

    canvas.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return;
        const point = getCanvasPoint(event);
        const item = findItemAt(point);
        if (item) {
            selectItem(item.id);
            settings.draggedItemId = item.id;
            canvas.setPointerCapture(event.pointerId);
            event.preventDefault();
        } else if (settings.selectedPalette) {
            placeAtCanvasPoint(point);
        } else {
            status.textContent = 'Choose a sticker from the palette, then click a grid point.';
        }
    });

    canvas.addEventListener('pointermove', (event) => {
        if (settings.draggedItemId === null) return;
        const item = items.find((entry) => entry.id === settings.draggedItemId);
        if (!item) return;
        const point = getCanvasPoint(event);
        const position = pixelToCoordinate(point.x, point.y, getGeometry(canvas.width, canvas.height));
        if (item.x === position.x && item.y === position.y) return;
        item.x = position.x;
        item.y = position.y;
        selectedCoordinate.textContent = `Selected: ${item.icon} ${item.name}`;
        render();
        renderTable();
    });

    function finishDragging() {
        if (settings.draggedItemId === null) return;
        const item = activeItem();
        settings.draggedItemId = null;
        if (item) status.textContent = `${item.name} moved. Read its new location from the grid.`;
    }

    canvas.addEventListener('pointerup', finishDragging);
    canvas.addEventListener('pointercancel', finishDragging);
    canvas.addEventListener('lostpointercapture', finishDragging);
    canvas.addEventListener('dragover', (event) => event.preventDefault());
    canvas.addEventListener('drop', (event) => {
        event.preventDefault();
        const rawData = event.dataTransfer.getData('application/x-town-item');
        if (!rawData) return;
        try {
            const data = JSON.parse(rawData);
            if (typeof data.name !== 'string' || typeof data.icon !== 'string'
                || ![0, 90].includes(data.rotation ?? 0)) {
                throw new Error('Invalid palette item.');
            }
            data.rotation = data.rotation ?? 0;
            placeAtCanvasPoint(getCanvasPoint(event), data);
        } catch (error) {
            status.textContent = 'That sticker could not be placed. Select it from the palette and try again.';
        }
    });

    modeButtons.forEach((button) => {
        button.addEventListener('click', () => {
            settings.mode = button.dataset.mode;
            modeButtons.forEach((modeButton) => {
                modeButton.setAttribute('aria-pressed', String(modeButton === button));
            });
            snapItemsToGrid();
            const selected = activeItem();
            if (selected) {
                selectedCoordinate.textContent = `Selected: ${selected.icon} ${selected.name}`;
            }
            render();
            renderTable();
            status.textContent = settings.mode === 'quadrant1'
                ? 'Quadrant I selected. Coordinates range from 0 to 10.'
                : 'Four-quadrant plane selected. Coordinates range from -8 to 8.';
        });
    });

    gridStepSelect.addEventListener('change', () => {
        settings.gridStep = Number(gridStepSelect.value);
        snapItemsToGrid();
        render();
        renderTable();
        status.textContent = settings.gridStep === 1
            ? 'Standard integer grid selected. Items snap to whole-number coordinates.'
            : 'Advanced half-step grid selected. Items snap to increments of 0.5.';
    });

    mapStyleSelect.addEventListener('change', () => {
        settings.mapStyle = mapStyleSelect.value;
        render();
        status.textContent = `${mapStyleSelect.options[mapStyleSelect.selectedIndex].text} street layout selected.`;
    });

    deleteSelectedButton.addEventListener('click', () => {
        if (settings.selectedItemId !== null) removeItem(settings.selectedItemId);
    });

    document.getElementById('clear-town').addEventListener('click', () => {
        items.splice(0, items.length);
        settings.selectedItemId = null;
        settings.selectedPalette = null;
        paletteButtons.forEach((button) => button.setAttribute('aria-pressed', 'false'));
        selectedCoordinate.textContent = 'Selected item: none';
        deleteSelectedButton.disabled = true;
        render();
        renderTable();
        status.textContent = 'Town cleared. Choose a sticker to start again.';
    });

    function drawExportLegend(ctx, x, y, width, height) {
        ctx.save();
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 27px Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('Town Legend / Coordinates', x + 24, y + 22);
        ctx.fillStyle = '#334155';
        ctx.font = '18px Arial, sans-serif';
        ctx.fillText(`Items placed: ${items.length}`, x + 24, y + 66);

        const contentTop = y + 108;
        const rowHeight = 34;
        const availableRows = Math.max(1, Math.floor((height - 128) / rowHeight));
        items.forEach((item, index) => {
            const rowIndex = index % availableRows;
            const column = Math.floor(index / availableRows);
            const columnX = x + 24 + column * (width / Math.max(1, Math.ceil(items.length / availableRows)));
            const rowY = contentTop + rowIndex * rowHeight;
            ctx.fillStyle = '#0f172a';
            ctx.font = '17px Arial, sans-serif';
            ctx.textAlign = 'left';
            const answerInput = coordinateRows.querySelector(`[name="coordinate-answer-${item.id}"]`);
            const studentAnswer = answerInput ? answerInput.value.trim() : '';
            ctx.fillText(`${item.icon} ${item.name}: ${studentAnswer || '________________'}`, columnX, rowY);
        });
        ctx.restore();
    }

    function exportTown() {
        const exportWidth = 1500;
        const rowHeight = 34;
        const legendHeight = Math.max(740, 150 + items.length * rowHeight);
        const exportHeight = Math.max(850, legendHeight + 100);
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = exportWidth;
        exportCanvas.height = exportHeight;
        const exportContext = exportCanvas.getContext('2d');
        if (!exportContext) {
            status.textContent = 'Could not create the PNG export canvas in this browser.';
            return;
        }

        exportContext.fillStyle = '#ffffff';
        exportContext.fillRect(0, 0, exportWidth, exportHeight);
        exportContext.fillStyle = '#0f172a';
        exportContext.font = 'bold 34px Arial, sans-serif';
        exportContext.textAlign = 'left';
        exportContext.textBaseline = 'top';
        exportContext.fillText('My Coordinate Town Plan', 30, 22);
        exportContext.fillStyle = '#334155';
        exportContext.font = '20px Arial, sans-serif';
        const studentName = studentNameInput.value.trim() || 'Not provided';
        exportContext.fillText(`Student: ${studentName}`, 32, 63);
        renderMap(exportContext, 900, 760, 20, 100);
        drawExportLegend(exportContext, 960, 100, 510, exportHeight - 130);

        try {
            const link = document.createElement('a');
            const safeStudentName = studentNameInput.value.trim().toLowerCase()
                .replace(/[^a-z0-9]+/g, '_')
                .replace(/^_+|_+$/g, '') || 'student';
            link.download = `town_plan_${safeStudentName}.png`;
            link.href = exportCanvas.toDataURL('image/png');
            link.click();
            status.textContent = `Your town map, name, and item list were downloaded as ${link.download}.`;
        } catch (error) {
            status.textContent = `The PNG could not be generated: ${error.message}`;
        }
    }

    document.getElementById('export-town').addEventListener('click', exportTown);

    render();
    renderTable();
})();

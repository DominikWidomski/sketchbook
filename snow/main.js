'use strict';

import ClassicalNoise from "./noise.js";

const map = (minRange, maxRange, minDomain, maxDomain, value) => {
    return minDomain + (maxDomain - minDomain) * (value - minRange) / (maxRange - minRange)
};

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

let visualiseField = true;

const { width, height } = canvas;

const noiseGenerator = new ClassicalNoise();
const noise = noiseGenerator.noise.bind(noiseGenerator);

// Array<Array<int>>
let field = [];
const particles = [];

for (let i = 0; i < 500; ++i) {
	particles.push({
		x: Math.random() * width,
		y: Math.random() * height,
		vx: 0,
		vy: Math.random() * 1 + 1
	})
}

let generating = false;
let fieldScale = 30;
let noiseScale = 10;
window.generateNoiseField = function(_fieldScale, _noiseScale) {
	requestAnimationFrame(() => {
		console.log("generating");
		fieldScale = _fieldScale;
		noiseScale = _noiseScale;
		field = [];

		for (let y = 0; y < height / fieldScale; ++y) {
			field[y] = [];
			for (let x = 0; x < width / fieldScale; ++x) {
				field[y][x] = {
					x: noise(
						x/width * fieldScale * noiseScale,
						y/height * fieldScale * noiseScale,
						0
					),
					y: 0
				};
			}
		}
	});
}

function draw() {
	ctx.clearRect(0, 0, width, height)

	ctx.fillStyle = "#222";
	ctx.fillRect(0, 0, width, height);

	ctx.fillStyle = "#fff";
	for (let i = 0; i < particles.length; ++i) {
		const p = particles[i];
		const vector = field[p.y/fieldScale | 0][p.x/fieldScale | 0];
		p.x += p.vx + vector.x;
		p.y += p.vy + vector.y;

		// Randomises x position when looping
		if (p.y > height) {
			p.x = Math.random() * width;
		}
		
		p.x = (p.x + width) % width;
		p.y = (p.y + height) % height;

		const {x, y} = p;

		ctx.fillRect(x, y, 2, 2);
	}

	
	if (visualiseField) {
		for (let y = 0; y < field.length; ++y) {
			const row = field[y];
			for (let x = 0; x < row.length; ++x) {
				const vector = row[x];
				const scale = fieldScale * 10;

				// ctx.fillStyle = "#FFF";
				// ctx.fillRect(x * fieldScale - 1, y * fieldScale - 1, 3, 3);

				// ctx.strokeStyle = `rgb(${map(0, 0.00005, 0, 255, Math.abs(vector.x))}, 0, ${map(0, 0.00005, 0, 255, Math.abs(vector.y))})`;
				ctx.strokeStyle = vector.x > 0 ? 'blue' : 'red';

				ctx.beginPath();
				ctx.moveTo(x * fieldScale, y * fieldScale);
				ctx.lineTo(x * fieldScale + (vector.x * scale), y * fieldScale + (vector.y * scale));
				ctx.stroke();
			}
		}
	}

	window.requestAnimationFrame(draw);
}

function twoWayBind(inputName, eventName = "change", changeCallback, setupCallback) {
	const input = document.querySelector(`input[name="${inputName}"`);

	input.addEventListener(eventName, event => {
		changeCallback(input, event);
	});

	setupCallback(input);
}

generateNoiseField(fieldScale, noiseScale);
window.requestAnimationFrame(draw);

twoWayBind(
	"visualiseField",
	"change",
	input => visualiseField = input.checked,
	input => input.checked = visualiseField
);

twoWayBind(
	"fieldScale",
	"input",
	input => generateNoiseField(input.value, noiseScale),
	input => input.value = fieldScale
);

twoWayBind(
	"noiseScale",
	"input",
	input => generateNoiseField(fieldScale, input.value),
	input => input.value = noiseScale
);

let options = ["none", "monochromatic", "triadic", "complementary", "split", "analogous", "tetradic"]
var mode = "none"
var horizontal = false
var generated = false;
// Create a new color picker instance
// https://iro.js.org/guide.html#getting-started
const colorPicker = new iro.ColorPicker(".colorPicker", {
	// color picker options
	// Option guide: https://iro.js.org/guide.html#color-picker-options
	width: 260,
	handleRadius: 9,
	borderWidth: 1,
	borderColor: "#fff",
});

var generated = false;
function setAllColors(color, scheme, scheme2=undefined) {
	//convert hex string to rgb

	if (!generated) {
		let setColors = calculateOthers(color, scheme)

		if (scheme2 != undefined) {
			setColors = setColors.concat(calculateOthers(color, scheme2))
		}
		if (mode != "none") {
			colorPicker.setColors(setColors)
		}
	}
	//sets the color in the color list
	let colorBlocksHTML = ""
	let colorBlocksHex = ""

	let hexValues = Object.values(colorPicker.colors).map(function(color) {
		return color.hexString;
	});
	hexValues = [...new Set(hexValues)].sort();

	let numColors = Math.floor(12 / hexValues.length)
	hexValues.forEach(function (color, idx) {
		colorBlocksHTML += `<div class="${horizontal ? "" : "row" } swatch" style="background: ${color};${horizontal ? "width: " + 100/hexValues.length + "%": ""}"></div>`
		colorBlocksHex += `<div class="col-${numColors}" style="${horizontal ? "width: " + 100/hexValues.length + "%": ""}"><span>${color}</span></div>`
	});
	if (horizontal){
		colorBlocksHTML += `<div style="height:${$(".swatch").css("height")};width:0px;padding:0px;margin:0px"></div>`
	}
	$("#colorList").html(colorBlocksHTML)
	$("#colorHex").html(colorBlocksHex)

	if (generated){
		$(".swatch").css("display", "none")
		$(".swatch").fadeIn(500)
		generated = false
	}

}

colorPicker.on(["mount", "color:setActive", "color:change"], function () {
	const hexString = colorPicker.color.hexString;
	$('#activeColor').children('div').css('background', hexString)
	$('#activeColor').children('span').html(hexString)
	setAllColors(colorPicker.color["$"], mode)
})



const HSBToRGB = (h, s, b) => {
	h = ((h % 360) + 360) % 360 //h %360
	s /= 100;
	b /= 100;
	const k = (n) => (n + h / 60) % 6;
	const f = (n) => b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
	return `rgb(${255 * f(5)}, ${255 * f(3)}, ${255 * f(1)})`
};


// https://www.ethangardner.com/articles/2009/03/15/a-math-based-approach-to-color-theory-using-hue-saturation-and-brightness-hsb/
// Calculate Other colors given a color scheme
function calculateOthers(baseColor, scheme) {
	let h = baseColor.h;
	let s = baseColor.s;
	let b = baseColor.v;
	let colors = []
	if (scheme == "triadic") {
		colors = [
			HSBToRGB(h, s, b),
			HSBToRGB(h + 120, s, b),
			HSBToRGB(h + 240, s, b)
		]
	} else if (scheme == "complementary") {
		colors = [
			HSBToRGB(h, s, b),
			HSBToRGB(h + 180, s, b)
		]
	} else if (scheme == "split") {
		colors = [
			HSBToRGB(h, s, b),
			HSBToRGB(h + 150, s, b),
			HSBToRGB(h + 210, s, b)
		]
	} else if (scheme == "analogous") {
		colors = [
			HSBToRGB(h, s, b),
			HSBToRGB(h - 30, s, b),
			HSBToRGB(h + 30, s, b)
		]
	} else if (scheme == "monochromatic") {
		colors = [
			HSBToRGB(h, s, b),
			HSBToRGB(h, s - (s / 3), b),
			HSBToRGB(h, s - (2 * s / 3), b)
		]
	} else if (scheme == "tetradic") {
		colors = [
			HSBToRGB(h, s, b),
			HSBToRGB(h + 90, s, b),
			HSBToRGB(h + 180, s, b),
			HSBToRGB(h + 270, s, b)
		]
	}
	return colors
}


// popover stuff
function skip(id) {
    // popovers.forEach(function (popover) {
    //     popover.tooltip.hide()
    // })
    $("#helpButton").removeAttr('disabled');
    popovers[id].tooltip.toggle()
    $("#grayScreen").click()
}

function show(id) {
    if (id >= 0) {
        popovers[id].tooltip.toggle()
        $(popovers[id].element).css("z-index", "auto")
    } else {
        $("#helpButton").attr('disabled', true);
    }
    if (id + 1 < popovers.length) {
        $(popovers[id + 1].element).css("z-index", "100000")
        popovers[id + 1].tooltip.toggle()
        addButton(id + 1)
    }

}

function addButton(id) {
    $(".popover-button-container").html(`
        <button type="button" class="btn btn-secondary" onclick="skip(${id})">Skip</button>
        <button type="button" class="btn btn-primary" id="button-${id}">Next</button>
    `);
    setTimeout(function () {
        $("#button-" + (id)).click(function () {
            if (id + 1 == popovers.length) {
                skip(id)
            } else {
                show(id)
            }
        })
    }
        , 500);
}
var popovers = []
function createPopover(element, title, content, add=true) {
	let tooltip = new bootstrap.Popover($(element)[0], {
		boundary: document.body,
		html: true,
		title: title,
		content: content,
		template: `
        <div class="popover" role="tooltip" value="a">
            <div class="popover-arrow"></div><h3 class="popover-header"></h3>
            <div class="popover-my-content">
                <div class="popover-body">
                </div>
                <div class="modal-footer popover-button-container">
                </div>
            </div>
        </div>`,
		id: 1,
		placement: 'right',
		trigger: 'manual',
		animation: true,
		customClass: 'hints'
	})
	if (add) {
		popovers.push({
			element: element,
			tooltip: tooltip
		})
	} else {
		$(element).css("z-index", "100000")
		tooltip.toggle()
		$(".popover-button-container").html(`
			<button type="button" class="btn btn-primary" id="button-help">Done</button>
		`);
		setTimeout(function () {
			$("#button-help").click(function () {
				tooltip.toggle()
				$("#grayScreen").click()
			})
		}
			, 500);
	}
	return tooltip
}
$(document).ready(function () {
    populateButtons()

    colorPicker.setColors([
        "rgb(255, 0, 0)",
        "rgb(0, 255, 0)",
        "rgb(0, 0, 255)",
    ])
});
let schemes = ["none", "monochromatic", "triadic", "complementary", "split", "analogous", "tetradic"]

function populateButtons() {
    schemes.forEach(scheme => {
        let button = `<div id="${scheme}" class='row tip'><img src="/static/img/${scheme}.svg" alt="${scheme} mode" class="icon" loading="lazy"><span>${scheme}</span></div>`
        $("#buttonContainer").append(button)
        $("#" + scheme).click(function () {
            if (scheme == "none") {
                $("#numColors").fadeOut()
            } else {
                $("#numColors").fadeIn()
            }
            mode = scheme
            $("#generate").click()
            // setAllColors(colorPicker.color["$"], mode)
        })
    })
}

let modeDict = {
    //"none": "none",
    "monochromatic": "monochrome",
    "triadic": "triad",
    "complementary": "complement",
    //"split": "analogic-complement",
    "analogous": "analogic",
    "tetradic": "quad",
}

let baseColor = undefined

$("#quantityMinus").click(function () {
    $("#quantity").val(parseInt($("#quantity").val()) - 1)
    getColorScheme(baseColor, mode)
})
$("#quantityPlus").click(function () {
    $("#quantity").val(parseInt($("#quantity").val()) + 1)
    getColorScheme(baseColor, mode)
})

function getColorScheme(color, scheme) {

    setTimeout(function () {
        $.ajax({
            url: `https://www.thecolorapi.com/scheme?mode=${modeDict[scheme]}&hex=${color}&count=${$("#quantity").val()}`,
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                if (data.colors.includes("#000000")) {
                    getColorScheme(color, scheme)
                } else {
                    let colors = []
                    generated = true
                    for (let i = 0; i < data.colors.length; i++) {
                        let color = data.colors[i]
                        colors.push(color.rgb.value)
                    }
                    colorPicker.setColors(colors)
                }
            },
            error: function (request, error) {
                // alert("Request: " + JSON.stringify(request));
            }
        });
    }, 350)
}

// on generate, generate a random color palette
$("#generate").click(function () {
    let randomColor = Math.floor(Math.random() * 16777215).toString(16);
    baseColor = randomColor
    $(".swatch").fadeOut(500)
    if (mode != "none" ) {
        if (mode == "split") {
            setAllColors(colorPicker.color["$"], mode);
            return
        }
        getColorScheme(randomColor, mode)
    } else {
        setTimeout(function () {
            $.ajax({
                url: 'http://colormind.io/api/',
                type: 'POST',
                data: JSON.stringify({
                    model: "default",
                }),
                dataType: 'json',
                success: function (data) {
                    let colors = []
                    generated = true
                    for (let i = 0; i < data.result.length; i++) {
                        let color = data.result[i]
                        colors.push(`rgb(${color[0]}, ${color[1]}, ${color[2]})`)
                    }
                    colorPicker.setColors(colors)

                },
                error: function (request, error) {
                    // alert("Request: " + JSON.stringify(request));
                }
            });
        }, 350)
    }
})

var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
})
function canMoveNext(id) {
    // returns whether or not the user can continue to the next section
    if (id == "2" && (colorPicker.color["$"].h >= 340 || colorPicker.color["$"].h <= 20)) {
        $("#grayScreen").click()
        createPopover(".IroWheel", "Hint: Hue", "Try moving the color around the wheel to see how the hue changes", add=false)
        return colorPicker.color["$"].h < 340 && colorPicker.color["$"].h > 20;
    } else if (id == "3" && colorPicker.color["$"].s >= 90) {
        $("#grayScreen").click()
        createPopover(".IroWheel", "Hint: Tone", "Try moving the color towards the center of the wheel to see how the tone changes", add=false)
        return colorPicker.color["$"].s < 90;
    } else if (id == "4" && colorPicker.color["$"].v >= 75) {
        $("#grayScreen").click()
        createPopover(".IroSlider", "Hint: Shade", "Try moving the bottom slider to see how the shade changes", add=false)
        return colorPicker.color["$"].v < 75;
    } else {
        return true
    }
}


$(document).ready(function () {
    let hints =
        [
            {
                "ele": ".IroWheel",
                "title": "Color Wheel",
                "hint": "Change the colors on the wheel"
            },
            {
                "ele": ".colorsCol",
                "title": "Color List",
                "hint": "Colors from the wheel can be seen here as a palette."
            },
            {
                "ele": ".IroWheel",
                "title": "Changing Saturation",
                "hint": "Moving towards or away from the center changes the saturation of the color (how much white is in the color)."
            },
            {
                "ele": ".IroSlider",
                "title": "Brightness Slider",
                "hint": "This slider changes the brightness of the color (how much black is in the color)."
            },
            {
                "ele": "#helpButton",
                "title": "Help Button",
                "hint": "To see this tutorial again, click this button"
            }
        ]

    hints.forEach(function (hint) {
        createPopover(hint.ele, hint.title, hint.hint)
    });
    if (hints.length > 0 && showPopover) {
        show(-1)
        $("#grayScreen").click();
    }
});
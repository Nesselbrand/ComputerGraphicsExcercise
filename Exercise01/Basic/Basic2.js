"use strict"

/** __Draws two circles using canvas utilities__
 * 
 * @param {Vec} center_blank - center of the circle without contour
 * @param {Vec} center_contour - center of the circle with contour
 * @param {number} radius_blank - radius of the circle without contour
 * @param {number} radius_contour_inner - radius of the inner circle of the circle with contour
 * @param {number} width_contour - width of the contour
 * @param {Vec} color_blank - color of the circle without contour
 * @param {Vec} color_contour_inner - color of the inner circle of the circle with contour
 * @param {Vec} color_contour_contour - color of the contour
 */
function drawArcCircle(canvas, center_blank, center_contour,
    radius_blank, radius_contour_inner, width_contour,
    color_blank, color_contour_inner, color_contour_contour) {

    let context = canvas.getContext("2d", { willReadFrequently: true });
    context.clearRect(0, 0, canvas.width, canvas.height);

    /** Converts a vector to a "rgb(r,g,b)" string used by javascript */
    function vec_to_string(color) {
        return "rgb(" + color.r + "," + color.g + "," + color.b + ")";
    }

    // ----- Draw filled circle without contour -----
    context.beginPath();
    context.fillStyle = vec_to_string(color_blank);
    context.arc(center_blank.x, center_blank.y, radius_blank, 0, 2 * Math.PI, false);
    context.fill();

    // ----- Draw circle with contour -----
    context.beginPath();
    context.fillStyle = vec_to_string(color_contour_inner);
    context.arc(center_contour.x, center_contour.y, radius_contour_inner, 0, 2 * Math.PI, false);
    context.fill();

    context.lineWidth = width_contour;
    context.strokeStyle = vec_to_string(color_contour_contour);
    context.stroke();
}

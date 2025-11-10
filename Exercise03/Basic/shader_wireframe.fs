precision mediump float;

varying vec3 fColor;   // interpolated barycentric-like coords from vertex colors
uniform bool wireframe;

void main(void)
{
    float epsilon = 0.01; // Kanten-Dicke: kleiner = dünnere Linien, größer = dickere Linien

    if (wireframe) {
        // d ist Abstand zur nächsten Kante in barycentric space (kleiner = nahe Kante)
        float d = min(min(fColor.x, fColor.y), fColor.z);

        // Wenn d größer als epsilon -> Pixel ist im Inneren -> verwirf es
        if (d > epsilon) {
            discard;
        }

        // Kantenfarbe (hier Schwarz). Du kannst das ändern.
        gl_FragColor = vec4(fColor, 1.0);
        return;
    }

    // Füllmodus: benutze die interpolierte Farbe direkt
    gl_FragColor = vec4(fColor, 1.0);
}

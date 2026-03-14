# Pasos siguientes

Editor de shaders.

Al igual que en los casos anteriores vamos a crear un editor que lea un markdown pero esta vez serán shaders, vertex y fragment.

El editor leerá el markdown y renderizará los shaders (solo son 2 por archivo).

El archivo markdown también tendrá los uniforms por defecto (si los necesita), los cuales serán: u_time, u_delta, u_resolution, u_mouse, u_mouse_pressed, u_frame.

También la resolución.

Si el editor detecta que son shaders, y no una web, en lugar de una consola se verá un visualizador de los uniforms (algunos pueden ser modificables si es necesario), los fps, la resolución.
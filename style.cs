body {
    margin: 0;
    background: #222;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    overflow: hidden;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

#game-container {
    position: relative;
    border: 4px solid #fff;
    background: #f0f8ff;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
}

canvas {
    display: block;
    max-width: 100vw;
    max-height: 90vh;
    background: #f0f8ff;
    touch-action: none; /* Critical for mobile play */
}

#ui {
    position: absolute;
    top: 15px;
    left: 15px;
    font-size: 24px;
    font-weight: bold;
    color: #333;
    pointer-events: none; /* Allows clicks to pass through to the game */
}
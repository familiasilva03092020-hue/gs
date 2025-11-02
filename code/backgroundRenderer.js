/**
	Renders a background portion of the level.
	Code by Rob Kleffner, 2011
*/

Mario.BackgroundRenderer = function(level, width, height, distance) {
    this.Level = level;
    this.Width = width;
    this.Distance = distance;
    this.TilesY = ((height / 32) | 0) + 1;
    
    this.Background = Mario.SpriteCuts.GetBackgroundSheet();
};

Mario.BackgroundRenderer.prototype = new Enjine.Drawable();

Mario.BackgroundRenderer.prototype.Draw = function(context, camera) {
    var xCam = camera.X / this.Distance;
    var x = 0, y = 0, b = null, frame = null;
    
    //the OR truncates the decimal, quicker than Math.floor
    var xTileStart = (xCam / 32) | 0;
    //the +1 makes sure the right edge tiles get drawn
    var xTileEnd = (((xCam + this.Width) / 32) | 0);


// --- Parallax sky/mountains/trees drawing (added) ---
    // draw sky gradient
    var g = context.createLinearGradient(0,0,0, this.TilesY*32);
    g.addColorStop(0, "#8ED6FF");
    g.addColorStop(1, "#70C1FF");
    context.fillStyle = g;
    context.fillRect(0, 0, this.Width, this.TilesY*32);

    // helper to draw repeated mountain silhouette
    function drawMountains(offset, scale, color) {
        context.save();
        context.globalAlpha = 0.9;
        context.fillStyle = color;
        var step = 120 * scale;
        for (var mx = -step + ((xCam/ (4 - scale)) % step); mx < this.Width + step; mx += step) {
            context.beginPath();
            var baseY = 120 * (1.0 - scale);
            context.moveTo(mx, baseY + 200*scale);
            context.lineTo(mx + 60*scale, baseY + 40*scale);
            context.lineTo(mx + 120*scale, baseY + 200*scale);
            context.closePath();
            context.fill();
        }
        context.restore();
    }

    // far mountains (slow)
    drawMountains.call(this, xCam*0.2, 0.8, "#6B8E23");
    // near mountains (faster)
    drawMountains.call(this, xCam*0.5, 1.0, "#2E8B57");

    // simple repeating clouds (very far, slowest)
    context.save();
    context.globalAlpha = 0.9;
    var cloudStep = 200;
    for (var cx = -cloudStep + ((xCam/8) % cloudStep); cx < this.Width + cloudStep; cx += cloudStep) {
        context.beginPath();
        var cy = 40;
        context.arc(cx + 30, cy, 18, 0, Math.PI*2);
        context.arc(cx + 50, cy+6, 22, 0, Math.PI*2);
        context.arc(cx + 80, cy, 16, 0, Math.PI*2);
        context.fillStyle = "rgba(255,255,255,0.85)";
        context.fill();
    }
    context.restore();
    // --- end parallax ---

    
    for (x = xTileStart; x <= xTileEnd; x++) {
        for (y = 0; y < this.TilesY; y++) {
            b = this.Level.GetBlock(x, y) & 0xff;
            frame = this.Background[b % 8][(b / 8) | 0];
            
            //bitshifting by five is the same as multiplying by 32
            context.drawImage(Enjine.Resources.Images["background"], frame.X, frame.Y, frame.Width, frame.Height, ((x << 5) - xCam) | 0, (y << 5) | 0, frame.Width, frame.Height);
        }
    }
};
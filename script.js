var RENDERER = {
	FIREWORK_INTERVAL_RANGE : {min : 20, max : 200},
	SKY_COLOR : 'hsla(750, 0%, %luminance%, 0.1)',
	
	init : function(){
		this.setParameters();
		this.reconstructMethod();
		this.render();
	},
	setParameters : function(){
		this.$container = $('#canvas-container');
		this.width = this.$container.width();
		this.height = this.$container.height();
		this.distance = Math.sqrt(Math.pow(this.width / 2, 2) + Math.pow(this.height / 2, 2));
		this.contextFireworks = $('<canvas />').attr({width : this.width, height : this.height}).appendTo(this.$container).get(0).getContext('2d');
		

		this.fireworks = [new FIREWORK(this.width, this.height, this)];
		
		
		this.maxFireworkInterval = this.getRandomValue(this.FIREWORK_INTERVAL_RANGE) | 0;
		this.fireworkInterval = this.maxFireworkInterval;
	},
	reconstructMethod : function(){
		this.render = this.render.bind(this);
	},
	getRandomValue : function(range){
		return range.min + (range.max - range.min) * Math.random();
	},


	render : function(){
		requestAnimationFrame(this.render);
		
		var maxOpacity = 0,
			
			contextFireworks = this.contextFireworks;
		
		for(var i = this.fireworks.length - 1; i >= 0; i--){
			maxOpacity = Math.max(maxOpacity, this.fireworks[i].getOpacity());
		}
		
		contextFireworks.fillStyle = this.SKY_COLOR.replace('%luminance', 5 + maxOpacity * 15);
		contextFireworks.fillRect(0, 0, this.width, this.height);
		
		for(var i = this.fireworks.length - 1; i >= 0; i--){
			if(!this.fireworks[i].render(contextFireworks)){
				this.fireworks.splice(i, 1);
			}
		}



		if(--this.fireworkInterval == 0){
			this.fireworks.push(new FIREWORK(this.width, this.height, this));
			this.maxFireworkInterval = this.getRandomValue(this.FIREWORK_INTERVAL_RANGE) | 0;
			this.fireworkInterval = this.maxFireworkInterval;
		}
	}
};

var FIREWORK = function(width, height, renderer){
	this.width = width;
	this.height = height;
	this.renderer = renderer;
	this.init();
};
FIREWORK.prototype = {
	COLOR : 'hsl(%hue, 80%, 60%)',
	PARTICLE_COUNT : 300,
	DELTA_OPACITY : 0.01,
	RADIUS : 2,
	VELOCITY : -3,
	WAIT_COUNT_RANGE : {min : 30, max : 60},
	THRESHOLD : 50,
	DELTA_THETA : Math.PI / 10,
	GRAVITY : 0.002,
	
	init : function(){
		this.setParameters();
		this.createParticles();
	},
	setParameters : function(){
		var hue = 256 * Math.random() | 0;
			
		this.x = this.renderer.getRandomValue({min : this.width / 8, max : this.width * 7 / 8});
		this.y = this.renderer.getRandomValue({min : this.height / 4, max : this.height / 2});
		this.x0 = this.x;
		this.y0 = this.height + this.RADIUS;
		this.color = this.COLOR.replace('%hue', hue);
		this.status = 0;
		this.theta = 0;
		this.waitCount = this.renderer.getRandomValue(this.WAIT_COUNT_RANGE);
		this.opacity = 1;
		this.velocity = this.VELOCITY;
		this.particles = [];
	},
	createParticles : function(){
		for(var i = 0, length = this.PARTICLE_COUNT; i < length; i++){
			this.particles.push(new PARTICLE(this.x, this.y, this.renderer));
		}
	},
	getOpacity : function(){
		return this.status == 2 ? this.opacity : 0;
	},
	render : function(context){
		switch(this.status){
		case 0:
			context.save();
			context.fillStyle = this.color;
			context.globalCompositeOperation = 'lighter';
			context.globalAlpha = (this.y0 - this.y) <= this.THRESHOLD ? ((this.y0 - this.y) / this.THRESHOLD) : 1;
			context.translate(this.x0 + Math.sin(this.theta) / 2, this.y0);
			context.scale(0.8, 2.4);
			context.beginPath();
			context.arc(0, 0, this.RADIUS, 0, Math.PI * 2, false);
			context.fill();
			context.restore();
			
			this.y0 += this.velocity;
			
			if(this.y0 <= this.y){
				this.status = 1;
			}
			this.theta += this.DELTA_THETA;
			this.theta %= Math.PI * 2;
			this.velocity += this.GRAVITY;
			return true;
		case 1:
			if(--this.waitCount <= 0){
				this.status = 2;
			}
			return true;
		case 2:
			context.save();
			context.globalCompositeOperation = 'lighter';
			context.globalAlpha = this.opacity;
			context.fillStyle = this.color;
			
			for(var i = 0, length = this.particles.length; i < length; i++){
				this.particles[i].render(context, this.opacity);
			}
			context.restore();
			this.opacity -= this.DELTA_OPACITY;
			return this.opacity > 0;
		}
	}
};
var PARTICLE = function(x, y, renderer){
	this.x = x;
	this.y = y;
	this.renderer = renderer;
	this.init();
};
PARTICLE.prototype = {
	RADIUS : 1.5,
	VELOCITY_RANGE : {min : 0, max : 3},
	GRAVITY : 0.02,
	FRICTION : 0.98,
	
	init : function(){
		var radian = Math.PI * 2 * Math.random(),
			velocity = (1 - Math.pow(Math.random(), 6)) * this.VELOCITY_RANGE.max,
			rate = Math.random();
			
		this.vx = velocity * Math.cos(radian) * rate;
		this.vy = velocity * Math.sin(radian) * rate;
	},
	render : function(context, opacity){
		context.beginPath();
		context.arc(this.x, this.y, this.RADIUS, 0, Math.PI * 2, false);
		context.fill();
		
		this.x += this.vx;
		this.y += this.vy;
		this.vy += this.GRAVITY;
		this.vx *= this.FRICTION;
		this.vy *= this.FRICTION;
	}
};
$(function(){
	RENDERER.init();
});
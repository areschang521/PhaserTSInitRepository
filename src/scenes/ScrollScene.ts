// You can write more code here

import { CenterObjectContainer } from "../core/CenterObjectContainer";
import { LayoutType } from "../core/Layout";
import { Swiper, SwiperDirection } from "../core/Swiper";

/* START OF COMPILED CODE */

import Phaser from "phaser";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class ScrollScene extends Phaser.Scene {

	constructor() {
		super("ScrollScene");

		/* START-USER-CTR-CODE */
        // Write your code here.
        /* END-USER-CTR-CODE */
	}

	preload(): void {

		this.load.pack("lobby-pack", "assets/lobby-pack.json");
	}

	editorCreate(): void {

		// swiperCon
		const swiperCon = this.add.container(359.5525817871094, 241.41388132409986);

		// rectangle_1
		const rectangle_1 = this.add.rectangle(600.4474107938938, 298.58611867590014, 1200, 600);
		swiperCon.add(rectangle_1);

		// item11
		const item11 = this.add.image(680.0626269752458, 298.58611867590014, "lobby", "lobby_ic_promo_room01.png");
		swiperCon.add(item11);

		// item10
		const item10 = this.add.image(680.0626269752458, 298.58611867590014, "lobby", "lobby_ic_promo_room02.png");
		swiperCon.add(item10);

		// item9
		const item9 = this.add.image(680.0626269752458, 298.58611867590014, "lobby", "lobby_ic_promo_room03.png");
		swiperCon.add(item9);

		// item8
		const item8 = this.add.image(680.0626269752458, 298.58611867590014, "lobby", "lobby_ic_promo_room04.png");
		swiperCon.add(item8);

		// item7
		const item7 = this.add.image(680.0626269752458, 298.58611867590014, "lobby", "lobby_ic_promo_room05.png");
		swiperCon.add(item7);

		// item6
		const item6 = this.add.image(680.0626269752458, 298.58611867590014, "lobby", "lobby_ic_promo_room06.png");
		swiperCon.add(item6);

		// item5
		const item5 = this.add.image(680.0626269752458, 298.58611867590014, "lobby", "lobby_ic_standard_room01.png");
		swiperCon.add(item5);

		// item4
		const item4 = this.add.image(1014, 368, "lobby", "lobby_ic_standard_room02.png");
		swiperCon.add(item4);

		// item3
		const item3 = this.add.image(165, 368, "lobby", "lobby_ic_standard_room03.png");
		swiperCon.add(item3);

		// item2
		const item2 = this.add.image(795, 335, "lobby", "lobby_ic_standard_room04.png");
		swiperCon.add(item2);

		// item1
		const item1 = this.add.image(382, 335, "lobby", "lobby_ic_standard_room05.png");
		swiperCon.add(item1);

		// item0
		const item0 = this.add.image(582, 299, "lobby", "lobby_ic_standard_room06.png");
		swiperCon.add(item0);

		this.item11 = item11;
		this.item10 = item10;
		this.item9 = item9;
		this.item8 = item8;
		this.item7 = item7;
		this.item6 = item6;
		this.item5 = item5;
		this.item4 = item4;
		this.item3 = item3;
		this.item2 = item2;
		this.item1 = item1;
		this.item0 = item0;
		this.swiperCon = swiperCon;

		this.events.emit("scene-awake");
	}

	public item11!: Phaser.GameObjects.Image;
	public item10!: Phaser.GameObjects.Image;
	public item9!: Phaser.GameObjects.Image;
	public item8!: Phaser.GameObjects.Image;
	public item7!: Phaser.GameObjects.Image;
	public item6!: Phaser.GameObjects.Image;
	public item5!: Phaser.GameObjects.Image;
	public item4!: Phaser.GameObjects.Image;
	public item3!: Phaser.GameObjects.Image;
	public item2!: Phaser.GameObjects.Image;
	public item1!: Phaser.GameObjects.Image;
	public item0!: Phaser.GameObjects.Image;
	public swiperCon!: Phaser.GameObjects.Container;

	/* START-USER-CODE */

    // Write your code here
    posArr = [
        { x: 165, y: 368, depth: 1, scale: 0.8, bright: 0.4 },
        { x: 382, y: 335, depth: 2, scale: 1, bright: 0.6 },
        { x: 582, y: 299, depth: 3, scale: 1.2, bright: 1 },
        { x: 795, y: 335, depth: 2, scale: 1, bright: 0.6 },
        { x: 1014, y: 368, depth: 1, scale: 0.8, bright: 0.4 },
    ];

    create() {
        this.editorCreate();
        this.createSwiper();
        this.layout();

    }

    createSwiper() {
        new Swiper({
            scene: this,
            con: this.swiperCon,
            duration: 2000,
            props: this.posArr,
            items: [this.item0, this.item1, this.item2, this.item3, this.item4, this.item5, this.item6, this.item7, this.item8, this.item9, this.item10, this.item11],
            waitTime: 1000,
            canDrag: true,
            direction: SwiperDirection.Left,
        });
    }

    layout() {
        const { swiperCon } = this;
        const centerCon = new CenterObjectContainer(this);
        centerCon.add(swiperCon, LayoutType.MIDDLE_CENTER, { x: 0, y: 0 }, true);
    }

    /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here

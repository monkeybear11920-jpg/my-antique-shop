const SHOP_INFO = {
    name: "河馬博古幽思",
    tel: "02-1234-5678",
    address: "台北市南港區經園街68號",
    email: "service@antique-shop.com",
    hours: "週一至週日 10:00 - 20:00"
};

const NAV_MENU = [
    { id: 'all', name: '首頁', link: 'shop_main.html' },
    { 
        id: 'tea', 
        name: '茶類', 
        sub: [
            { id: 'puer', name: '普洱茶' },
            { id: 'high-mountain', name: '高山茶' },
            { id: 'green', name: '綠茶' }
        ] 
    },
    { 
        id: 'art', 
        name: '畫作', 
        sub: [
            { id: 'landscape', name: '山水畫' }
        ] 
    },
    { 
        id: 'tools', 
        name: '器具', 
        sub: [
            { id: 'teaware', name: '茶具' }
        ] 
    },
    { id: 'about', name: '關於我們', link: 'about.html' }
];

const products = [
    { 
        id: "puer-01", 
        name: "【陳年】勐海大樹普洱", 
        category: "puer",
		price: 1000, 
        images: [
            "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=500",
            "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=500",
            "https://images.unsplash.com/photo-1594631252845-29fc4586d241?w=500"
        ],
        desc: "這款特級普洱採摘自雲南勐海海拔1800公尺以上的古樹。經過八年自然陳化，湯色紅濃明亮，入口醇厚回甘，帶有獨特的沉香與棗香。"
    },
    { 
        id: "puer-02", 
        name: "【陳年】易武古樹熟茶", 
		category: "puer",
        price: 500, 
        img: "https://images.unsplash.com/photo-1594631252845-29fc4586d241?w=500",
        desc: "易武茶區以「溫潤」聞名。此款熟茶發酵適度，茶湯如絲綢般滑順，性質溫和不傷胃，是日常品飲與長輩送禮的首選。"
    },
    { 
        id: "green-01", 
        name: "【特選】手捻綠茶餅", 
		category: "green",
        price: 200, 
        img: "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=500",
        desc: "嚴選清晨初綻的一芽一葉，由資深茶師手工揉捻成餅。完整保留茶多酚，湯色翠綠，風味清新甘甜，充滿春天盎然的新意。"
    },
	{ 
        id: "teaware-01", 
        name: "【潮州茶具】朱泥茶具套組", 
		category: "teaware",
        price: 5000, 
        img: "images/teaware-01.jpeg",
        desc: `【附證書】 *茶具套組：內含1個蓋碗及4個主人杯* 
				泥料：潮州朱泥及潮州瓷土 
				注意事項：
				1. 茶具均屬手工藝品，陶土經入窯燒製後可能會有輕微的尺寸、顏色、圖案等差異
				2. 原料中含鐵等礦物質，高溫燒製會形成黑點、針孔、小凸起、流釉不均等情況，均屬正常現象。`
    }
];
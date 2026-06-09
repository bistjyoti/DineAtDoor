import mongoose from "mongoose";
import foodModel from "./models/foodModel.js";
import fs from "fs";

const MONGO_URI = "mongodb://bistjyoti:jyoti1234@ac-lg8wzso-shard-00-00.a9bwasv.mongodb.net:27017,ac-lg8wzso-shard-00-01.a9bwasv.mongodb.net:27017,ac-lg8wzso-shard-00-02.a9bwasv.mongodb.net:27017/DineAtDoor?ssl=true&replicaSet=atlas-9h4vax-shard-0&authSource=admin&appName=DineAtDoor";

const restaurantsConfig = [
     
    { id: "69fada160a78c82b1ae645db", file: "./data/mohitdhaba.json", category: "Indian", defaultDesc: "Fresh and delicious Mohit Dhaba specialty. Perfect to satisfy extreme hunger!" },
    { id: "69fb3af868cf27577bf58e33", file: "./data/punjabidhaba.json", category: "Indian", defaultDesc: "Authentic Punjabi style rich delicacy. Great when you are super hungry." },
    { id: "69fb3af868cf27577bf58e36", file: "./data/hangries.json", category: "Fast Food", defaultDesc: "Delicious, greasy fast food for your heavy hunger cravings." },
    { id: "69fb3af868cf27577bf58e37", file: "./data/baapofrolls.json", category: "Rolls", defaultDesc: "Loaded, wrapped premium rolls to kill your hunger instantly." },
    { id: "69fb3af868cf27577bf58e38", file: "./data/kfc.json", category: "Chicken & Burgers", defaultDesc: "Crispy fried crunchies. Ultimate cheat day fuel for a hungry stomach." },
    { id: "69fb3af868cf27577bf58e3a", file: "./data/burgersingh.json", category: "Burgers", defaultDesc: "Big fat Indian style crafted burgers, satisfying heavy hunger cravings." },
    { id: "69fb3af968cf27577bf58e45", file: "./data/shwarmajaan.json", category: "Fast Food", defaultDesc: "Perfectly spiced Mediterranean and local shawarmas to curb hunger." },
    { id: "69fb3af968cf27577bf58e46", file: "./data/thalaivabriyani.json", category: "Biryani", defaultDesc: "Aromatic, long-grain basmati biryani cooked on dum to satisfy heavy hunger." },

    { id: "69fb3af868cf27577bf58e34", file: "./data/nozypizza.json", category: "Pizza", defaultDesc: "Cheesy and hot freshly baked pizza. Sure to make you feel happy and celebrated!" },

    { id: "69fb3af868cf27577bf58e35", file: "./data/fivestarjanta.json", category: "Sweets & Snacks", defaultDesc: "Famous sweet treats for sad moments or custom premium celebrations." },
    { id: "69fb3af868cf27577bf58e39", file: "./data/thebelgiumwaffleco.json", category: "Desserts", defaultDesc: "Warm, crispy waffle with premium toppings. A sweet escape for a sad mood." },

    { id: "69fb3af968cf27577bf58e3b", file: "./data/cafecoffeeday.json", category: "Beverages", defaultDesc: "Premium freshly brewed hot coffee and bakes to help you relax and feel comfortable." },
    { id: "69fb3af968cf27577bf58e44", file: "./data/patialalassi.json", category: "Beverages", defaultDesc: "Thick, rich, and creamy authentic Punjabi lassi, perfect to stay comfortable." },
    { id: "69fb3af968cf27577bf58e3f", file: "./data/tarmarind.json", category: "South Indian", defaultDesc: "Authentic coastal and light traditional main course, light and comfortable." },
    { id: "69fb3af968cf27577bf58e47", file: "./data/dabbaco.json", category: "Indian", defaultDesc: "Delicious and hearty tiffin-style home meals, nostalgic and comfortable." },

    { id: "69fb3af968cf27577bf58e3c", file: "./data/hotelprakash.json", category: "Indian", defaultDesc: "Traditional premium meals cooked to perfection." },
    { id: "69fb3af968cf27577bf58e3d", file: "./data/tanishas.json", category: "Indian", defaultDesc: "Delicious homestyle and premium dynamic meals." },
    { id: "69fb3af968cf27577bf58e3e", file: "./data/civillineskathirollsandmomo.json", category: "Rolls & Momos", defaultDesc: "Crispy momos and perfectly wrapped kathi rolls." },
    { id: "69fb3af968cf27577bf58e40", file: "./data/lickachick.json", category: "Mughlai", defaultDesc: "Juicy tandoori items and rich non-veg gravies." },
    { id: "69fb3af968cf27577bf58e41", file: "./data/olive.json", category: "Continental", defaultDesc: "Exotic and multi-cuisine delicious preparations." },
    { id: "69fb3af968cf27577bf58e42", file: "./data/thecookhouse.json", category: "Indian", defaultDesc: "Chef special recipes crafted to absolute perfection." },
    { id: "69fb3af968cf27577bf58e43", file: "./data/pdcombokitchen.json", category: "Chinese & Combos", defaultDesc: "Super-saver and filling meal combos for anytime hunger cravings." }
];

const getCorrectCategoryAndMood = (dishName, defaultCategory) => {
    const name = dishName.toLowerCase();
    let category = defaultCategory;
    let moodTag = "";

    if (name.includes("raita") || name.includes("salad") || name.includes("papad") || name.includes("chutney")) {
        category = "Sides";
    } else if (name.includes("roti") || name.includes("naan") || name.includes("parantha") || name.includes("kulcha") || name.includes("phulka")) {
        category = "Bread";
    } else if (name.includes("lassi") || name.includes("shake") || name.includes("mojito") || name.includes("coke") || name.includes("water") || name.includes("soda")) {
        category = "Beverages";
        moodTag = " Perfect companion to stay relaxed and comfortable.";
    } else if (name.includes("ice cream") || name.includes("jamun") || name.includes("halwa") || name.includes("pudding") || name.includes("pastry") || name.includes("cake") || name.includes("waffle")) {
        category = "Desserts";
        moodTag = " A sweet ultimate treat to fix a sad mood!";
    } else if (name.includes("pizza") || name.includes("burger") || name.includes("fry") || name.includes("shawarma")) {
        moodTag = " Cheat meal calculated to make you super happy.";
    } else if (name.includes("biryani") || name.includes("rice") || name.includes("thali") || name.includes("curry")) {
        moodTag = " Heavy, standard filling item perfect for hungry appetites.";
    }
    
    return { category, moodTag };
};

const extractAllItemCards = (obj) => {
    let items = [];
    if (!obj || typeof obj !== 'object') return items;
    
    if (obj.itemCards && Array.isArray(obj.itemCards)) {
        items = [...items, ...obj.itemCards];
    }
    if (obj.card && obj.card.info && obj.card.info.id) {
        items.push(obj);
    }
    for (const key in obj) {
        if (obj.hasOwnProperty(key) && typeof obj[key] === 'object') {
            items = [...items, ...extractAllItemCards(obj[key])];
        }
    }
    return items;
};

const syncAllMenus = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB...");

        for (const restro of restaurantsConfig) {
            console.log(`\n---------------------------------------`);
            console.log(`Processing file: ${restro.file}...`);

            if (!fs.existsSync(restro.file)) {
                console.log(`Skip: File '${restro.file}' nahi mili.`);
                continue;
            }

            const rawData = fs.readFileSync(restro.file, "utf-8");
            const jsonData = JSON.parse(rawData);

            let allItems = extractAllItemCards(jsonData);

            const uniqueItemsMap = new Map();
            allItems.forEach(item => {
                const itemId = item?.card?.info?.id;
                if (itemId && !uniqueItemsMap.has(itemId)) {
                    uniqueItemsMap.set(itemId, item);
                }
            });
            const finalUniqueItems = Array.from(uniqueItemsMap.values());

            const dishes = finalUniqueItems.map(item => {
                const info = item?.card?.info;
                if (!info) return null;

                const rawPrice = info.price || info.defaultPrice || 0;
                if (rawPrice === 0) return null; 

                const price = rawPrice / 100;
                
                if (info.name === restro.category || info.name === "Dummy" || info.name.length < 2) {
                    return null;
                }

                const parsedData = getCorrectCategoryAndMood(info.name, restro.category);
                const finalDescription = (info.description || restro.defaultDesc) + parsedData.moodTag;

                return {
                    name: info.name,
                    price: price,
                    description: finalDescription,
                    image: info.imageId ? `https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/${info.imageId}` : "default_food.png",
                    category: parsedData.category, 
                    restaurantId: new mongoose.Types.ObjectId(restro.id)
                };
            }).filter(Boolean); 

            console.log(`Cleaned valid dishes for ${restro.file}: ${dishes.length}`);

            if (dishes.length > 0) {
                await foodModel.deleteMany({ restaurantId: new mongoose.Types.ObjectId(restro.id) });
                await foodModel.insertMany(dishes);
                console.log(`Success: Cleaned dishes injected for ID: ${restro.id}`);
            }
        }

        await mongoose.connection.close();
        console.log("\n=======================================");
        console.log("Cleanup Sync Done with Smart Category and Mood Tags!");
        
    } catch (error) {
        console.error("Error during synchronization:", error);
    }
};

syncAllMenus();
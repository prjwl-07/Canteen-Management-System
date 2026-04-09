
async function checkImages() {
    try {
        const res = await fetch('http://localhost:5000/api/menu');
        const data = await res.json();
        console.log("Found " + data.length + " items.");
        data.forEach(item => {
            console.log(`Name: ${item.name}`);
            console.log(`Image: '${item.image}'`);
            console.log('---');
        });
    } catch (err) {
        console.error(err);
    }
}

checkImages();

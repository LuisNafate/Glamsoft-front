document.getElementById("carrucel")

const button  = document.getElementById("prev")



items = ["14","15","16","17","18"]

button.addEventListener("click", () => {
    items.map( (item, index) => {
        items[index] = item + 1
    })
})

fetch('https://glamsoft.onrender.com/api/products')
    .then(response => response.json())
    .then(data => {
        
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });


    const apiUrl = 'https://glamsoft.onrender.com/api/products';

    const loadingState = document.getElementById('loading');
    async function fetchProducts() {
        try {
            const response = await fetch(apiUrl);
            loadingState.style.display = 'none';
            loadingState.innerText = '<>Loading...<>';
            const data = await response.json();
            loadingState.style.display = 'none';
            loadingState.innerText = '';
            console.log(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }  
    }





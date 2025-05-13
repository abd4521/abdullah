function setupProvinceCityMapping() {
    const cities = {
      "Punjab": ["Lahore", "Faisalabad", "Rawalpindi", "Multan", "Gujranwala"],
      "Sindh": ["Karachi", "Hyderabad", "Sukkur", "Larkana", "Nawabshah"],
      "KPK": ["Peshawar", "Abbottabad", "Mardan", "Swat", "Kohat"],
      "Balochistan": ["Quetta", "Gwadar", "Turbat", "Khuzdar", "Sibi"]
    };
    
    document.getElementById("checkoutProvince")?.addEventListener("change", function() {
      const province = this.value;
      const cityInput = document.getElementById("checkoutCity");
      
      if (province && cities[province]) {
        let datalist = document.getElementById("citiesDatalist");
        if (!datalist) {
          datalist = document.createElement("datalist");
          datalist.id = "citiesDatalist";
          document.body.appendChild(datalist);
          cityInput.setAttribute("list", "citiesDatalist");
        }
        
        datalist.innerHTML = '';
        cities[province].forEach(city => {
          const option = document.createElement("option");
          option.value = city;
          datalist.appendChild(option);
        });
      }
    });
  }

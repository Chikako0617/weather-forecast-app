'use strict'

$(document).ready(function(){
    const key = import.meta.env.VITE_WEATHER_APP_API_KEY;
    let lat = '35.640570936547036';
    let lon = '140.0639253054739';
    const icon = 'http://openweathermap.org/img/wn/';
    const cityNames = {
        'Sapporoshi':{'name':'札幌', 'lat':'43.059609901309074', 'lon':'141.3516001115126'},
        'Tokyo':{'name':'東京', 'lat':'35.68117079936142', 'lon':'139.76543520042193'},
        'Mihama':{'name':'美浜', 'lat':'35.640570936547036', 'lon':'140.0639253054739'},
        'Aichi':{'name':'愛知', 'lat':'35.170937401722696', 'lon':'136.88083045200503'},
        'Osaka':{'name':'大阪', 'lat':'34.70232999512874', 'lon':'135.49304269786484'},
        'Izumo':{'name':'出雲', 'lat':'35.39581655888832', 'lon':'132.68599048915618'},
        'Fukuoka':{'name':'福岡', 'lat':'33.50382510569055', 'lon':'130.69087079298052'},
        'Naha':{'name':'那覇', 'lat':'26.214741545873757', 'lon':'127.67409253038828'}
    };

    function fetchWeatherData(lat, lon){
        const url = 'https://api.openweathermap.org/data/2.5/forecast?lat='+lat+'&lon='+lon+'&appid='+key+'&lang=ja';
        $.ajax({
            url:url,
            type:'get',
            cache:false,
            dataType:'json'
        }).done(function(data){
            console.log(data);
            $('#weather-data').empty();


            //背景画像
            let picture = document.getElementById('top-wrapper');
            let todayIcon = data.list[2].weather[0].icon.slice(0, 2);
            let dttxtHour = data.list[2].dt_txt.slice(11, 13);
            let rainImages = ["url('picture/rain.jpg')", "url('picture/rain2.jpg')"];
        
            switch (todayIcon){
                case '01':
                case '02':
                    if (dttxtHour === '06' || dttxtHour === '09'){
                        picture.style.backgroundImage = "url('picture/morning.jpg')";
                    } else if (dttxtHour === '12' || dttxtHour === '15'){
                        picture.style.backgroundImage = "url('picture/daytime.jpg')";
                    } else if (dttxtHour === '18'){
                        picture.style.backgroundImage = "url('picture/evening.jpg')";
                    } else if (dttxtHour === '21' || dttxtHour === '00' || dttxtHour === '03'){
                        picture.style.backgroundImage = "url('picture/night.jpg')";
                    }
                    break;
                case '03':
                case '04':
                    if (dttxtHour === '21' || dttxtHour === '00' || dttxtHour === '03'){
                        picture.style.backgroundImage = "url('picture/cloud-night.jpg')";
                    } else {
                        picture.style.backgroundImage = "url('picture/cloud.jpg')";
                    }
                    break;
                case '09':
                case '10':
                case '11':
                case '50':
                    if (dttxtHour === '21' || dttxtHour === '00' || dttxtHour === '03'){
                        picture.style.backgroundImage = "url('picture/rain-night.jpg')";
                    } else {
                        let random = Math.floor(Math.random() * rainImages.length);
                        picture.style.backgroundImage = rainImages[random];
                    }
                    break;
                case '13':
                    if (dttxtHour === '21' || dttxtHour === '00' || dttxtHour === '03'){
                        picture.style.backgroundImage = "url('picture/snow-night.jpg')";
                    } else {
                        picture.style.backgroundImage = "url('picture/snow.jpg')";
                    }
            }

            //日付の書き換え
            function rewriteDT(){
                const today = data.list[2].dt_txt;
                const [date, time] = today.split(' ');
                const [year, month, day] = date.split('-');
                const monthWithoutLeadingZero = month.startsWith('0') ? month.substring(1) : month;
                const formattedDates = `${year}/${monthWithoutLeadingZero}/${day.startsWith('0') ? day.substring(1) : day}`;


            //時間の書き換え
                const timeWithoutSeconds = time.slice(0, 2);
                const timeWithoutLeadingZero = timeWithoutSeconds.startsWith('0') ? timeWithoutSeconds.substring(1) : timeWithoutSeconds;
                return `${formattedDates}　${timeWithoutLeadingZero}時`;
            }


            //地名の日本語変換
            const englishCityNames = data.city.name;
            const japaneseCityNames = cityNames[englishCityNames]?.name || englishCityNames;
            document.getElementById('area').innerHTML = japaneseCityNames;


            //気温変換
            const kelvinMax = (data.list[2].main.temp_max);
            const kelvinMin = (data.list[2].main.temp_min);
            let celsiusMax = kelvinMax - 273.15;
            let truncatedCelesiusMax = Math.floor(celsiusMax * 10) / 10;
            let celsiusMin = kelvinMin - 273.15;
            let truncatedCelesiusMin = Math.floor(celsiusMin * 10) / 10;


            //必須項目
            const result = rewriteDT();
            $('#date').html(result);
            $('#celsius-max').html(truncatedCelesiusMax);
            $('#celsius-min').html(truncatedCelesiusMin);
            // $('#area').html(data.city.name);
            $('#humidity').html(data.list[2].main.humidity);
            $('#windspeed').html(data.list[2].wind.speed);


            //アイコン作成の関数
            function appendWeatherIcon (iconContainer, weatherData){
                let imageUrl = icon + weatherData + 'd@2x.png';
                let imgElement = document.createElement('img');
                imgElement.src = imageUrl;
                imgElement.alt = weatherData.description;
                iconContainer.appendChild(imgElement);
            }


            //３時間毎天気のアイコン
            $('#3hours-icons').empty();
            for (let i=2; i<=6; i++){
                let iconContainer = document.getElementById('3hours-icons');
                let iconWithoutDN = (data.list[i].weather[0].icon).slice(0, 2);
                appendWeatherIcon(iconContainer, iconWithoutDN);
            }


            //３時間毎天気の時間
            let threeHoursTimeOutput = '';

            for (let i=2; i<=6; i++){
                let threeHoursDay = data.list[i].dt_txt;
                let [day, time] = threeHoursDay.split(' ');
                let timeWithoutSeconds = time.slice(0, 2);
                let timeWithoutLeadingZero = timeWithoutSeconds.startsWith('0') ? timeWithoutSeconds.substring(1) : timeWithoutSeconds;
                threeHoursTimeOutput += '<p>' + `${timeWithoutLeadingZero}時` + '</p>';
            }

            document.getElementById('3hours-time').innerHTML = threeHoursTimeOutput;


            //３時間毎天気
            let TWeatherOutput = '';
            for (let i=2; i<=6; i ++){
                let TWeather = data.list[i].weather[0].description;
                TWeatherOutput += '<p>' + TWeather + '</p>';
            }

            document.getElementById('3hours-weather').innerHTML = TWeatherOutput;


            //明日以降天気のアイコン
            $('#weekly-icons').empty();
            for (let i=2; i<=39; i+=8){
                if(i>=10){
                    let iconContainer = document.getElementById('weekly-icons');
                    let iconWithoutDN = (data.list[i].weather[0].icon).slice(0, 2);
                    appendWeatherIcon(iconContainer, iconWithoutDN);
                }
            }


            //明日以降天気の日付、時間
            let datesOutput = '';
            let timeOutput = '';

            for (let i=2; i<=39; i+=8){
                if(i>=10){
                    let weeklyDay = data.list[i].dt_txt;
                    let [date, time] = weeklyDay.split(' ');
                    let [year, month, day] = date.split('-');
                    let monthWithoutLeadingZero = month.startsWith('0') ? month.substring(1): month;
                    let formattedDates = `${monthWithoutLeadingZero}/${day.startsWith(0) ? day.substring(1): day}`;
                    datesOutput += '<p>' + formattedDates + '</p>';
                    
                    let timeWithoutSeconds = time.slice(0, 2);
                    let timeWithoutLeadingZero = timeWithoutSeconds.startsWith('0') ? timeWithoutSeconds.substring(1) : timeWithoutSeconds;

                    timeOutput += '<p>' + `${timeWithoutLeadingZero}時`+ '</p>';
                }
            }

            document.getElementById('weekly-dates').innerHTML = datesOutput;
            document.getElementById('weekly-time').innerHTML = timeOutput;


            //明日以降の天気
            let WWeatherOutput = '';
            for (let i=2; i<=39; i+=8){
                if(i>=10){
                    let WWeather = data.list[i].weather[0].description;
                    WWeatherOutput += '<p>' + WWeather + '</p>';
                }
            }

            document.getElementById('weekly-weather').innerHTML = WWeatherOutput;

        });
    }

    //その他の地域
    fetchWeatherData(lat, lon);

    const citiesContainer = document.getElementById('cities');
    citiesContainer.querySelectorAll('.city').forEach(cityElement => {
        cityElement.addEventListener('click', () => {
            const cityKey = cityElement.getAttribute('data-city');
            const cityInfo = cityNames[cityKey];
            lat = lat.replace(lat, cityInfo.lat);
            lon = lon.replace(lon, cityInfo.lon);
            fetchWeatherData(lat, lon);
        });
    });

});

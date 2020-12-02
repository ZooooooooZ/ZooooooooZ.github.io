/* eslint-disable no-tabs */
// Метод ymaps.ready() запустит функцию init, когда Yandex.Map API полностью прогрузится.
ymaps.ready(init);
function init() {
	// Переменная в которой хранится метка
	let myPlacemark;
	// Создаем карту в контейнере 'map' (объект класса Map)
	const myMap = new ymaps.Map("map", {
		center: [55.753994, 37.622093],
		zoom: 9,
	}, {
		// Поиск по топонимам и организациям
		searchControlProvider: "yandex#search",
	});

	// Слушаем клик на карте.
	myMap.events.add("click", (e) => {
		// Получаем координаты клика
		const coords = e.get("coords");
		// Если метка уже создана –  передвигаем ее.
		if (myPlacemark) {
			// Записываем новые координаты метки
			myPlacemark.geometry.setCoordinates(coords);
			// eslint-disable-next-line brace-style
		}
		// Если нет – создаем новую метку.
		else {
			// Создаем метку
			myPlacemark = createPlacemark(coords);
			// Добавляем метку в коллекцию geoObjects
			myMap.geoObjects.add(myPlacemark);
			// Слушаем событие окончания перетаскивания на метке.
			myPlacemark.events.add("dragend", () => {
				getAddress(myPlacemark.geometry.getCoordinates());
			});
		}
		// Выполняем обратное геокодирование
		getAddress(coords);
	});

	// Создание метки по полученным координатам.
	function createPlacemark(coords) {
		return new ymaps.Placemark(coords, {
			iconCaption: "поиск...",
		}, {
			preset: "islands#violetDotIconWithCaption",
			draggable: true,
		});
	}

	// Функция определяющая адрес по координатам.
	function getAddress(coords) {
		// Подпись иконки геообъекта
		myPlacemark.properties.set("iconCaption", "поиск...");
		// Определяем гео-данные по координатам
		ymaps.geocode(coords).then((res) => {
			const firstGeoObject = res.geoObjects.get(0);

			myPlacemark.properties.set({
				// Формируем строку с данными об объекте.
				iconCaption: [
					// Название населенного пункта или вышестоящее
					// административно-территориальное образование.
					firstGeoObject.getLocalities().length ? firstGeoObject.getLocalities()
						: firstGeoObject.getAdministrativeAreas(),
					// Получаем путь до топонима, если метод вернул null,
					// запрашиваем наименование здания.
					firstGeoObject.getThoroughfare() || firstGeoObject.getPremise(),
				].filter(Boolean).join(", "),
				// В качестве контента балуна задаем строку с адресом объекта.
				balloonContent: firstGeoObject.getAddressLine(),
			});
		});
	}
}

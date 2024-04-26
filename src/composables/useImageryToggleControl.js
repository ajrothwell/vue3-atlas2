import $config from '@/config';
import { useMapStore } from '@/stores/MapStore.js';

export default function useImageryControl() {

  const MapStore = useMapStore();
  const map = MapStore.map;

  class ImageryToggleControl {
    constructor({ id = "", className = "", title = "", imgSrc = "", eventHandler = function () {} }){
      this._id = id;
      this._className = className;
      this._title = title;
      this._imgSrc = imgSrc;
      this._eventHandler = eventHandler;
    }
  
    onAdd(map) {
      this._map = map;
      this._container = document.createElement('div');
      this._container.className = 'maplibregl-ctrl';
      this._button = document.createElement('button');
      this._button.type = 'button';
      this._button.onclick = this._eventHandler;
      this._img = document.createElement('img');
      this._img.id = this._id;
      this._img.src=this._imgSrc;
      this._img.style = 'max-width: 100%; border-radius: 5px'
      this._button.appendChild(this._img);
      this._container.appendChild(this._button);
      return this._container;
    }
    onRemove() {
      this._container.parentNode.removeChild(this._container);
      this._map = undefined;
    }
  }

  const toggleImagery = () => {
    const MapStore = useMapStore();
    const map = MapStore.map;
    // console.log('toggleImagery, map.getStyle:', map.getStyle());
    const style = map.getStyle();
    if (style.name === 'imageryMap') {
      map.setStyle($config[MapStore.currentTopicMapStyle]);
      const image = document.getElementById('imagery-toggle-control');
      image.src = import.meta.env.VITE_PUBLICPATH + 'images/imagery_small.png';
    } else {
      map.setStyle($config.imageryMapStyle);
      const image = document.getElementById('imagery-toggle-control');
      image.src = import.meta.env.VITE_PUBLICPATH + 'images/basemap_small.png';
    }
  }

  const imageryToggleControl = new ImageryToggleControl({
    id:'imagery-toggle-control',
    className: "test",
    title: 'image',
    imgSrc: import.meta.env.VITE_PUBLICPATH + 'images/imagery_small.png',
    eventHandler: toggleImagery,
  });

  return {
    imageryToggleControl,
  }
}
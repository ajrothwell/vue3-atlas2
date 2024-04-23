import { useRouter } from 'vue-router';
const router = useRouter();

export default function useAddressSearchControl() {

  class AddressSearchControl {
    constructor({ id = "", className = "", title = "", eventHandler = function () {} }){
      this._id = id;
      this._className = className;
      this._title = title;
      this._eventHandler = eventHandler;
    }
  
    onAdd(map) {
      this._map = map;
      this._container = document.createElement('div');
      this._container.className = 'maplibregl-ctrl';
      this._input = document.createElement('input');
      this._input.className = 'input';
      this._input.onkeydown = this._eventHandler;
      // this._img = document.createElement('img');
      // this._img.id = this._id;
      // this._img.src=this._imgSrc;
      // this._img.style = 'max-width: 100%; border-radius: 5px'
      // this._button.appendChild(this._img);
      this._container.appendChild(this._input);
      return this._container;
    }
    onRemove() {
      this._container.parentNode.removeChild(this._container);
      this._map = undefined;
    }
  }

  const hello = (value) => {
    const router = useRouter();
    if (value.key === 'Enter') {
      console.log('hello, value:', value.srcElement.value);
      router.replace({ name: 'search', query: { address: value.srcElement.value }})
    }
  }

  const addressSearchControl = new AddressSearchControl({
    id:'address-search-control',
    className: "test",
    title: 'image',
    imgSrc: './src/assets/imagery_small.png',
    eventHandler: hello,
  });

  

  return {
    addressSearchControl,
  }

}
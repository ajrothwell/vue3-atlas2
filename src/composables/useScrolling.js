import { useMainStore } from '@/stores/MainStore';

export default function useScrolling() {

  const handleRowMouseover = (e, id) => {
    console.log('handleRowMouseover, e:', e, 'id:', id);//, 'e.target.parentElement.id:', e.target.parentElement.id);
    const MainStore = useMainStore();
    // let hoveredStateId = parseInt(e.target.parentElement.id);
    let hoveredStateId = parseInt(e.row[id]);
    if (isNaN(hoveredStateId)) {
      hoveredStateId = e.row[id];
      // hoveredStateId = e.target.parentElement.id;
    }
    MainStore.hoveredStateId = hoveredStateId;
    // if (typeof e.target.parentElement.id === 'number') {
      // console.log('if, hovered state id', e.target.parentElement.id, 'typeof e.target.parentElement.id:', typeof e.target.parentElement.id);
      // MainStore.hoveredStateId = parseInt(e.target.parentElement.id);
    // } else {
    //   console.log('else, hovered state id', e.target.parentElement.id, 'typeof e.target.parentElement.id:', typeof e.target.parentElement.id);
    // }
  }
  const handleRowMouseleave = (e) => {
    const MainStore = useMainStore();
    MainStore.hoveredStateId = '';
  }

  const isElementInViewport = (el) => {
    console.log('isElementInViewport, el:', el);
    const rect = el.getBoundingClientRect();
    // console.log('bounding box', rect);
    const visibility = {
      // TODO the 108 below is account for the combined height of the
      // app header and address header. this is not a good long-term
      // solution - instead, use the `bottom` value of the address header's
      // bounding rect. however, this should only fire on small devices,
      // which would require again hard-coding screen breakpoints from
      // standards or some other magic, which might not a huge
      // improvement in terms of decoupling logic and presentation. hmm.
      top: rect.top >= 108,
      left: rect.left >= 0,
      bottom: rect.bottom <= (window.innerHeight || document.documentElement.clientHeight),
      right: rect.right <= (window.innerWidth || document.documentElement.clientWidth),
    };
    // return if all sides are visible
    return Object.values(visibility).every(val => val);
  }

  return {
    handleRowMouseover,
    handleRowMouseleave,
    isElementInViewport,
  }

}
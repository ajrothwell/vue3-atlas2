<script setup>
import $config from '@/config';

console.log('Nearby.vue setup');
import { ref, computed, watch, onMounted } from 'vue';

import { useNearbyActivityStore } from '@/stores/NearbyActivityStore';
const NearbyActivityStore = useNearbyActivityStore();
import { useMainStore } from '@/stores/MainStore';
const MainStore = useMainStore();
import { useMapStore } from '@/stores/MapStore';
const MapStore = useMapStore();
const map = MapStore.map;

import useTransforms from '@/composables/useTransforms';
const { currency, date } = useTransforms();

import { useRouter, useRoute } from 'vue-router';
const route = useRoute();
const router = useRouter();

const timeReverseFn = (a, b, fieldName) => new Date(b[fieldName]) - new Date(a[fieldName]);
const timeFn  = (a, b, fieldName) => new Date(a[fieldName]) - new Date(b[fieldName]);

const dataTypes = {
  nearby311: '311 Requests',
  nearbyCrimeIncidents: 'Crime Incidents',
  nearbyZoningAppeals: 'Zoning Appeals',
  nearbyVacantIndicatorPoints: 'Vacant Properties',
  nearbyConstructionPermits: 'Construction Permits',
  nearbyDemolitionPermits: 'Demolition Permits',
  nearbyImminentlyDangerous: 'Imminently Dangerous',
}

const dataDropdownOpen = ref(false);
const toggleDataDropdown = () => dataDropdownOpen.value = !dataDropdownOpen.value;
// const dataType = ref('nearby311');
const currentNearbyDataType = computed(() => {
  return MainStore.currentNearbyDataType;
});
const loadingData = computed(() => NearbyActivityStore.loadingData );
const setDataTypeInRouter = (newDataType) => {
  router.push({ name: 'address-topic-and-data', params: { address: MainStore.currentAddress, topic: route.params.topic, data: newDataType } });
}

watch(() => route.params.data, async (newDataType) => {
  if (newDataType) {
    MainStore.setCurrentNearbyDataType(newDataType);
    await setDataType(newDataType);
  }
})

const setDataType = async (newDataType) => {
  // dataType.value = newDataType;
  if (NearbyActivityStore[newDataType] === null) {
    console.log('fetching new data')
    await NearbyActivityStore.fetchData(newDataType);
  }
  setTimeInterval(timeIntervals[newDataType].values[0]);
}

const sortbyDropdownOpen = ref(false);
const toggleSortbyDropdown = () => sortbyDropdownOpen.value = !sortbyDropdownOpen.value;
const sortby = ref('distance');
const setSortby = (newSortby) => {
  sortby.value = newSortby;
}

const timeDropdownOpen = ref(false);
const toggleTimeDropdown = () => timeDropdownOpen.value = !timeDropdownOpen.value;
const timeInterval = ref(null);
onMounted( () => {
  timeInterval.value = timeIntervals[currentNearbyDataType.value].values[0];

  // let hoveredStateId = null;
  // console.log('map.getStyle().sources:', map.getStyle().sources, 'map.getStyle().layers:', map.getStyle().layers);
  // map.on('mouseenter', 'nearby', (e) => {
  //   if (e.features.length > 0) {
  //     // if (hoveredStateId) {
  //     //   console.log('mouse on Feature hoveredStateId:', hoveredStateId);
  //     // }
  //     hoveredStateId = e.features[0].id;
  //     console.log('mouse on Feature hoveredStateId:', hoveredStateId);
  //     map.setPaintProperty(
  //       'nearby', 
  //       'circle-color', 
  //       ['match', ['get', 'id'], hoveredStateId, "#FFFF00" , "#FF0000"]
  //     );
  //   }
  // });

  // map.on('mouseleave', 'nearby', () => {
  //   if (hoveredStateId) {
  //     console.log('mouse leave Feature hoveredStateId:', hoveredStateId);
  //     map.setPaintProperty(
  //       'nearby', 
  //       'circle-color', 
  //       '#FF0000'
  //     );
  //   }
  //   hoveredStateId = null;
  // });
})
// const timeInterval = computed({
//   get() {
//     return timeIntervals[currentNearbyDataType.value].values[0];
//   },
//   set(newTimeInterval) {
//     timeInterval.value = newTimeInterval;
//   }
// });
const timeIntervalLabel = computed(() => timeIntervals[currentNearbyDataType.value].labels[timeIntervals[currentNearbyDataType.value].values.indexOf(timeInterval.value)]);
const setTimeInterval = (newTimeInterval) => {
  timeInterval.value = newTimeInterval;
}

const timeIntervals = {
  nearby311: {
    labels: ['the last 30 days', 'the last 90 days', '1 year'],
    values: [30, 90, 365],
  },
  nearbyCrimeIncidents: {
    labels: ['the last 30 days', 'the last 90 days'],
    values: [30, 90],
  },
  nearbyZoningAppeals: {
    labels: ['any time', 'the last 90 days', 'the next 90 days'],
    values: [0, -90, 90],
  },
  nearbyVacantIndicatorPoints: {
    labels: [],
    values: [],
  },
  nearbyConstructionPermits: {
    labels: ['the last 30 days', 'the last 90 days', '1 year'],
    values: [30, 90, 365],
  },
  nearbyDemolitionPermits: {
    labels: ['the last 30 days', 'the last 90 days', '1 year'],
    values: [30, 90, 365],
  },
  nearbyImminentlyDangerous: {
    labels: ['the last 30 days', 'the last 90 days', '1 year'],
    values: [30, 90, 365],
  },
}

// nearby311 computed
const nearby311 = computed(() => {
  if (NearbyActivityStore.nearby311) {
    let data = [ ...NearbyActivityStore.nearby311.data.rows]
      .filter(item => {
      let itemDate = new Date(item.requested_datetime);
      let now = new Date();
      let timeDiff = now - itemDate;
      let daysDiff = timeDiff / (1000 * 60 * 60 * 24);
      return daysDiff <= timeInterval.value;
    })
    if (sortby.value === 'distance') {
      data.sort((a, b) => a.distance - b.distance)
    } else if (sortby.value === 'time') {
      data.sort((a, b) => timeReverseFn(a, b, 'requested_datetime'))
    }
    return data;
  }
});

const nearby311Geojson = computed(() => {
  let features = [];
  if (!nearby311.value) return features;
  for (let item of nearby311.value) {
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [item.lng, item.lat]
      },
      // id: item.service_request_id,
      properties: {
        id: item.service_request_id,
      }
    })
  }
  return features;
})

watch (() => nearby311Geojson.value, (newGeojson) => {
  console.log('nearby311Geojson watch, newGeojson:', newGeojson);
  if (newGeojson.length > 0) {
    // $config.nearbyDrawnMapStyle.sources.nearby.data.features = newGeojson;
    console.log('$config:', $config, 'map.getStyle().sources:', map.getStyle().sources, 'map.getStyle().layers:', map.getStyle().layers);
    let geojson = {
      'type': 'FeatureCollection',
      'features': newGeojson,
    }
    console.log('geojson:', geojson, 'map.getSource(nearby):', map.getSource('nearby'));
    map.getSource('nearby').setData(geojson);
  }
})

// nearbyCrimeIncidents computed
const nearbyCrimeIncidents = computed(() => {
  if (NearbyActivityStore.nearbyCrimeIncidents) {
    let data = [ ...NearbyActivityStore.nearbyCrimeIncidents.data.rows]
      .filter(item => {
      let itemDate = new Date(item.dispatch_date);
      let now = new Date();
      let timeDiff = now - itemDate;
      let daysDiff = timeDiff / (1000 * 60 * 60 * 24);
      return daysDiff <= timeInterval.value;
    })
    if (sortby.value === 'distance') {
      data.sort((a, b) => a.distance - b.distance)
    } else if (sortby.value === 'time') {
      data.sort((a, b) => timeReverseFn(a, b, 'dispatch_date'))
    }
    return data;
  }
});

const nearbyCrimeIncidentsGeojson = computed(() => {
  let features = [];
  if (!nearbyCrimeIncidents.value) return features;
  for (let item of nearbyCrimeIncidents.value) {
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [item.lng, item.lat]
      },
      // properties: {
      id: item.id,
      // }
    })
  }
  return features;
})

watch (() => nearbyCrimeIncidentsGeojson.value, async (newGeojson) => {
  console.log('nearbyCrimeIncidents watch, newGeojson:', newGeojson);
  if (newGeojson.length > 0) {
    // $config.nearbyDrawnMapStyle.sources.nearby.data.features = newGeojson;
    console.log('$config:', $config, 'map.getStyle().sources:', map.getStyle().sources, 'map.getStyle().layers:', map.getStyle().layers);
    let geojson = {
      'type': 'FeatureCollection',
      'features': newGeojson,
    }
    await map.getSource('nearby').setData(geojson);
    map.setPaintProperty(
      'nearby',
      'fill-color',
      '#faafee'
    );
    // map.getLayer('nearby').setPaintProperty({
    //   'circle-color': 'blue',
    //   'circle-radius': 6,
    //   'circle-stroke-width': 1,
    //   'circle-stroke-color': 'white',
    // });
    console.log('geojson:', geojson, 'map.getSource(nearby):', map.getSource('nearby'));
  }
})

// nearbyZoningAppeals computed
const nearbyZoningAppeals = computed(() => {
  if (NearbyActivityStore.nearbyZoningAppeals) {
    let data = [ ...NearbyActivityStore.nearbyZoningAppeals.data.rows]
    console.log(new Date(data[0].scheduleddate));
      
    if (timeInterval.value < 0) {
      data = data.filter(item => {
        let itemDate = new Date(item.scheduleddate);
        let now = new Date();
        let timeDiff = now - itemDate;
        let daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        return daysDiff >= timeInterval.value;
      })
    } else if (timeInterval.value > 0) {
      data = data.filter(item => {
        let itemDate = new Date(item.scheduleddate);
        let now = new Date();
        let timeDiff = now - itemDate;
        let daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        return daysDiff <= timeInterval.value;
      })
    }
    if (sortby.value === 'distance') {
      data.sort((a, b) => a.distance - b.distance)
    } else if (sortby.value === 'time') {
      data.sort((a, b) => timeReverseFn(a, b, 'dispatch_date'))
    }
    return data;
  }
});

// nearbyVacantIndicatorPoints computed
const nearbyVacantIndicatorPoints = computed(() => {
  if (NearbyActivityStore.nearbyVacantIndicatorPoints) {
    let data = [ ...NearbyActivityStore.nearbyVacantIndicatorPoints]
    if (sortby.value === 'distance') {
      data.sort((a, b) => a._distance - b._distance)
    } else if (sortby.value === 'type') {
      data.sort((a, b) => a.distance - b.distance)
    }
    return data;
  }
});

// nearbyConstructionPermits computed

// nearbyDemolitionPermits computed

// nearbyImminentlyDangerous computed



</script>

<template>
  <section>
    <div class="box">
      See recent activity near your search address including 311 service requests, crimes, zoning appeals, and more. Hover over a record below to highlight it on the map.
    </div>

    <!-- DATA DROPDOWN-->
    <div
      :class="dataDropdownOpen ? 'dropdown is-active' : 'dropdown'"
      @click="toggleDataDropdown"
    >
      <div class="dropdown-trigger">
        <button class="button" aria-haspopup="true" aria-controls="dropdown-menu">
          <span>What nearby activity would you like to see?</span>
          <span class="icon is-small">
            <i class="fas fa-angle-down" aria-hidden="true"></i>
          </span>
        </button>
      </div>
      <div class="dropdown-menu" id="dropdown-menu" role="menu">
        <div class="dropdown-content">
          <a class="dropdown-item" @click="setDataTypeInRouter('nearby311')">311 Requests</a>
          <a class="dropdown-item" @click="setDataTypeInRouter('nearbyCrimeIncidents')">Crime Incidents</a>
          <a class="dropdown-item" @click="setDataTypeInRouter('nearbyZoningAppeals')">Zoning Appeals</a>
          <a class="dropdown-item" @click="setDataTypeInRouter('nearbyVacantIndicatorPoints')">Vacant Properties</a>
          <a class="dropdown-item" @click="setDataTypeInRouter('nearbyConstructionPermits')">Construction Permits</a>
          <a class="dropdown-item" @click="setDataTypeInRouter('nearbyDemolitionPermits')">Demolition Permits</a>
          <a class="dropdown-item" @click="setDataTypeInRouter('nearbyImminentlyDangerous')">Imminently Dangerous</a>
        </div>
      </div>
    </div>
    <span>{{ dataTypes[currentNearbyDataType] }}</span>
    <br>

    <!-- TIME INTERVAL DROPDOWN -->
    <div
      :class="timeDropdownOpen ? 'dropdown is-active' : 'dropdown'"
      @click="toggleTimeDropdown"
    >
      <div class="dropdown-trigger">
        <button class="button" aria-haspopup="true" aria-controls="dropdown-menu">
          <span>From</span>
          <span class="icon is-small">
            <i class="fas fa-angle-down" aria-hidden="true"></i>
          </span>
        </button>
      </div>
      <div class="dropdown-menu" id="dropdown-menu" role="menu">
        <div class="dropdown-content">
          <a
            v-for="(item, index) of timeIntervals[currentNearbyDataType].values"
            class="dropdown-item"
            @click="setTimeInterval(item)"
          >
            {{ timeIntervals[currentNearbyDataType].labels[index] }}
          </a>
        </div>
      </div>
    </div>
    <span>{{ timeIntervalLabel }}</span>

    <!-- SORTBY DROPDOWN -->
    <div
      :class="sortbyDropdownOpen ? 'dropdown is-active' : 'dropdown'"
      @click="toggleSortbyDropdown"
    >
      <div class="dropdown-trigger">
        <button class="button" aria-haspopup="true" aria-controls="dropdown-menu">
          <span>Sort by</span>
          <span class="icon is-small">
            <i class="fas fa-angle-down" aria-hidden="true"></i>
          </span>
        </button>
      </div>
      <div class="dropdown-menu" id="dropdown-menu" role="menu">
        <div class="dropdown-content">
          <a class="dropdown-item" @click="setSortby('distance')">distance</a>
          <a class="dropdown-item" @click="setSortby('time')">time</a>
        </div>
      </div>
    </div>
    <span>{{ sortby }}</span>
    <br>

    <!-- nearby311 -->
    <div class='mt-5' v-if="currentNearbyDataType == 'nearby311'">
      <h5 class="subtitle is-5">311 Requests</h5>
      <div v-if="loadingData">Loading...</div>
      <table class="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>Date</th>
            <th>Location</th>
            <th>Type</th>
            <th>Distance</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in nearby311">
            <td>{{ date(item.requested_datetime) }}</td>
            <td>{{ item.address }}</td>
            <td>{{ item.service_name }}</td>
            <td>{{ (item.distance * 3.28084).toFixed(0) }} ft</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- nearbyCrimeIncidents -->
    <div class='mt-5' v-if="currentNearbyDataType == 'nearbyCrimeIncidents'">
      <h5 class="subtitle is-5">Crime Incidents</h5>
      <div v-if="loadingData">Loading...</div>
      <table class="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>Date</th>
            <th>Location</th>
            <th>Description</th>
            <th>Distance</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in nearbyCrimeIncidents">
            <td>{{ item.dispatch_date }}</td>
            <td>{{ item.location_block }}</td>
            <td>{{ item.text_general_code }}</td>
            <td>{{ (item.distance * 3.28084).toFixed(0) }} ft</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- nearbyZoningAppeals -->
    <div class='mt-5' v-if="currentNearbyDataType == 'nearbyZoningAppeals'">
      <h5 class="subtitle is-5">Zoning Appeals</h5>
      <div v-if="loadingData">Loading...</div>
      <table class="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>Date</th>
            <th>Location</th>
            <th>Description</th>
            <th>Distance</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in nearbyZoningAppeals">
            <td>{{ item.scheduleddate }}</td>
            <td>{{ item.address }}</td>
            <td>{{ item.appeal_grounds }}</td>
            <td>{{ (item.distance * 3.28084).toFixed(0) }} ft</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- nearbyVacantIndicatorPoints -->
    <div class='mt-5' v-if="currentNearbyDataType == 'nearbyVacantIndicatorPoints'">
      <h5 class="subtitle is-5">Likely Vacant Properties</h5>
      <div v-if="loadingData">Loading...</div>
      <table class="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>Address</th>
            <th>Property Type</th>
            <th>Distance</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in nearbyVacantIndicatorPoints">
            <td>{{ item.properties.ADDRESS }}</td>
            <td>{{ item.properties.VACANT_FLAG }}</td>
            <td>{{ (item._distance * 3.28084).toFixed(0) }} ft</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
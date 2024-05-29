<script setup>
import $config from '@/config';
import { ref, computed, onMounted, onBeforeMount } from 'vue';

  // import the GeocodeStore and DorParcels
import { useGeocodeStore } from '@/stores/GeocodeStore';
const GeocodeStore = useGeocodeStore();
import { useParcelsStore } from '@/stores/ParcelsStore';
const ParcelsStore = useParcelsStore();
import { useZoningStore } from '@/stores/ZoningStore';
const ZoningStore = useZoningStore();
import { useMainStore } from '@/stores/MainStore';
const MainStore = useMainStore();
import CollectionSummary from '@/components/CollectionSummary.vue';

import useTransforms from '@/composables/useTransforms';
const { date, rcoPrimaryContact } = useTransforms();

let selectedParcelId = computed(() => { return MainStore.selectedParcelId });
const selectedParcel = computed(() => {
  if (ParcelsStore.dor.features && ParcelsStore.dor.features.length > 0) {
    return ParcelsStore.dor.features.filter(feature => feature.id === selectedParcelId.value)[0];
  }
});
const selectedDocs = computed(() => {
  if (selectedParcelId.value) {
    console.log('selected.value:', selectedParcelId.value);
    return DorStore.dorDocuments[selectedParcelId.value].data.features;
  } else {
    return null;
  }
});

// ZONING APPEALS
const zoningAppealsCompareFn = (a, b) => new Date(b.scheduleddate) - new Date(a.scheduleddate);
const zoningAppeals = computed(() => {
  if (!ZoningStore.zoningAppeals.rows) return [];
  return ZoningStore.zoningAppeals.rows.sort(zoningAppealsCompareFn);
});

const getLinkAppeals = (item) => {
  let address = item.address;
  if (item.unit_num && item.unit_num != null) {
    address += ' Unit ' + item.unit_num;
  }
  return "<a target='_blank' href='https://li.phila.gov/Property-History/search/Appeal-Detail?address="+encodeURIComponent(address)+"&Id="+item.appealnumber+"'>"+item.appealnumber+"<i class='fa fa-external-link-alt'></i></a>";
};

onBeforeMount(() => {
  console.log('Zoning.vue onBeforeMount');
  if (ParcelsStore.dor.features && ParcelsStore.dor.features.length > 0) {
    MainStore.selectedParcelId = ParcelsStore.dor.features[0].properties.OBJECTID;
  }
});

onMounted(() => {
  // const topic = document.getElementById('Property-topic');
  // topic.scrollIntoView();
  // const main = document.getElementById('main');
  // const mainScrollTop = main.scrollTop;
  // main.scrollTo(0, mainScrollTop - 80);
});

</script>

<template>
  <div id="Zoning-description" class="box">Base district zoning maps, associated zoning overlays, and Registered Community Organizations applicable to your search address. If you notice a discrepancy, please contact <a href="mailto:planning@phila.gov">planning@phila.gov</a>. Source: Department of Planning and Development</div>
  <collection-summary
    :value="'STATUS'"
    :descriptor="'parcel'"
  >
  </collection-summary>
  <div v-if="selectedParcel" id="parcel-div" class="section add-borders p-3">
    <div class="columns is-multiline is-mobile">
      <div
        v-for="parcel in ParcelsStore.dor.features"
        :key="parcel.properties.OBJECTID"
        @click="MainStore.selectedParcelId = parcel.properties.OBJECTID"
        class="column is-3 add-borders has-text-centered p-2"
        :class="{ 'is-selected': parcel.properties.OBJECTID === selectedParcelId }"
      >
        {{ parcel.properties.MAPREG }}
      </div>
    </div>

    <div class="columns mt-3" v-if="selectedParcel">
      <div class="columns is-multiline is-mobile column is-8 is-offset-2 has-text-centered badge">
        <div class="column is-12 badge-title"><b>Base District</b></div>
        <div class="column is-3 code"><b>{{ ZoningStore.zoningBase[selectedParcelId].rows[0].long_code }}</b></div>
        <div class="column is-9 description">{{ $config.ZONING_CODE_MAP[ZoningStore.zoningBase[selectedParcelId].rows[0].long_code] }}</div>
      </div>
    </div>

    <h5 class="subtitle is-5 table-title">Pending Bills</h5>
    <div class="horizontal-table">
      <table id="pending-bills" class="table is-fullwidth is-striped no-link-at-bottom">
        <thead>
          <tr>
            <th>Bill Type</th>
            <th>Current Zoning</th>
            <th>Pending Bill</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in ZoningStore.pendingBills[selectedParcelId]">
            <td>{{ item.billType }}</td>
            <td>{{ item.currentZoning }}</td>
            <td v-html="`<a target='_blank' href='${item.pendingbillurl}'>${item.pendingbill} <i class='fa fa-external-link-alt'></i></a>`"></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class='mobile-no-data' v-if="!ZoningStore.pendingBills[selectedParcelId].length">No pending bills found</div>

    <h5 class="subtitle is-5 table-title">Overlays</h5>
    <table id="overlays" class="table is-fullwidth is-striped">
      <thead>
        <tr>
          <th>Name</th>
          <th>Code Section</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in ZoningStore.zoningOverlays[selectedParcelId].rows">
          <td>{{ item.overlay_name }}</td>
          <td v-html="`<a target='_blank' href='${item.code_section_link}'>${item.code_section} <i class='fa fa-external-link-alt'></i></a>`"></td>
        </tr>
      </tbody>
    </table>
    <div class='mobile-no-data' v-if="!ZoningStore.zoningOverlays[selectedParcelId].rows.length">No pending bills found</div>
  </div>

  <h5 class="subtitle is-5 table-title">Appeals</h5>
  <div class="horizontal-table">
    <table id="appeals" class="table is-fullwidth is-striped no-link-at-bottom">
      <thead>
        <tr>
          <th>Processed Date</th>
          <th>Id</th>
          <th>Description</th>
          <th>Scheduled Date</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in zoningAppeals">
          <td>{{ date(item.createddate) }}</td>
          <td v-html="getLinkAppeals(item)"></td>
          <td>{{ item.appealgrounds }}</td>
          <td>{{ date(item.scheduleddate) }}</td>
          <td>{{ item.decision }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class='mobile-no-data' v-if="!zoningAppeals.length">No appeals found</div>

  <div class="box">Looking for zoning documents? They are now located in the Licenses & Inspections tab under "Zoning Permit Documents".</div>

  <h5 class="subtitle is-5 table-title">Registered Community Organizations</h5>
  <div id="rcos" class="horizontal-table">
    <table class="table is-fullwidth is-striped link-at-bottom">
      <thead>
        <tr>
          <th>RCO</th>
          <th>Meeting Address</th>
          <th>Primary Contact</th>
          <th>Preferred Method</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in ZoningStore.rcos.features">
          <td v-html = "'<b>' + item.properties.ORGANIZATION_NAME + '</b><br>'
                + item.properties.ORGANIZATION_ADDRESS"></td>
          <td>{{ item.properties.MEETING_LOCATION_ADDRESS }}</td>
          <td v-html="rcoPrimaryContact(item.properties.PRIMARY_NAME + '<br>'
                + item.properties.PRIMARY_PHONE + '<br>'
                + item.properties.PRIMARY_EMAIL)"></td>
          <td>{{ item.properties.PREFFERED_CONTACT_METHOD }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class='mobile-no-data' v-if="!ZoningStore.rcos.features.length">No RCOs found</div>
  <div class="table-link">
    <a target="_blank" href="//www.phila.gov/documents/registered-community-organization-rco-materials/">See a list of all RCOs in the city [PDF] <font-awesome-icon icon='fa-solid fa-external-link-alt'></font-awesome-icon></a>
  </div>

</template>

<style scoped>

.add-borders {
  border: 1px solid #ccc;
}

.is-selected {
  background-color: #b8b8b8
}

#parcel-div {
  margin-bottom: 1.5rem;
}

.badge-title {
  padding-top: 0.25rem !important;
  height: 2rem;
  color: white;
  background-color: #58c04d;
  border-style: solid;
  border-color: white;
  border-width: 1px;
}

.code {
  background-color: #f0f0f0;
  border-style: solid;
  border-color: white;
  border-width: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.description {
  background-color: #f0f0f0;
  border-style: solid;
  border-color: white;
  border-width: 1px;
}

@media 
only screen and (max-width: 760px),
(min-device-width: 768px) and (max-device-width: 1024px)  {

  /* td {
    padding-left: 85px !important;
  } */

	/* Label the data */
	#pending-bills {
    td {
      min-height: 60px;
    }

    td:nth-of-type(1):before { content: "Bill Type"; }
    td:nth-of-type(2):before { content: "Current Zoning"; }
    td:nth-of-type(3):before { content: "Pending Bill"; }
  }

  #overlays {
    td {
      min-height: 60px;
    }

    td:nth-of-type(1):before { content: "Name"; }
    td:nth-of-type(2):before { content: "Code Section"; }
  }

  #appeals {
    td {
      min-height: 60px;
    }

    td:nth-of-type(1):before { content: "Processed Date"; }
    td:nth-of-type(2):before { content: "Id"; }
    td:nth-of-type(3):before { content: "Description"; }
    td:nth-of-type(4):before { content: "Scheduled Date"; }
    td:nth-of-type(5):before { content: "Status"; }
  }

  #rcos {
    td {
      min-height: 60px;
    }

    td:nth-of-type(1):before { content: "RCO"; }
    td:nth-of-type(2):before { content: "Meeting Address"; }
    td:nth-of-type(3):before { content: "Primary Contact"; }
    td:nth-of-type(4):before { content: "Preferred Method"; }
  }
}

</style>
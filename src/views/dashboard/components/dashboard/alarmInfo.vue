<template>
  <div class="alarmInfo-container">
    <Vue3SeamlessScroll :list="alarmList" :hover="true" :step="0.4"  :wheel="true" :isWatch="true" :limitScrollNum="4" style="height: 100%;overflow:hidden;">
      <div class="alarm-item" v-for="(item, index) in alarmList" :key="index">
        <div class="flex-between mb5">
          <span class="alarm-name">{{item.area}}</span>
          <span>{{item.alarmTime}}</span>
        </div>
        <div class="flex-between">
          <span>{{item.alarmInfo}}</span>
          <div class="item-level" :class="changeAlarmBg(item.alarmLevel)">{{getLevel(item.alarmLevel)}}</div>
        </div>
      </div>
    </Vue3SeamlessScroll>
  </div>
</template>

<script setup>
import { Vue3SeamlessScroll } from 'vue3-seamless-scroll'
import { onMounted, ref } from 'vue'

const alarmList = ref([])

function getAlarmList(){
  alarmList.value = [
    {
      "id": "1840213663235485697",
      "paramName": "1",
      "alarmTime": "2024-09-29 10:15:00",
      "alarmInfo": "샤오미 마우스 재고 경고",
      "alarmLevel": "0",
      "area": "우장 창고\t",
      "equipment": "Z2QB379B5N",
      "alarmVal": "19.90",
      "count": null,
      "proportion": null,
      "lastCount": null,
      "name": null
    },
    {
      "id": "1840213663235485697",
      "paramName": "1",
      "alarmTime": "2024-09-29 10:15:00",
      "alarmInfo": "수산 배 유효기간 경고",
      "alarmLevel": "0",
      "area": "창수 창고\t",
      "equipment": "Z2QB379B5N",
      "alarmVal": "19.90",
      "count": null,
      "proportion": null,
      "lastCount": null,
      "name": null
    },
    {
      "id": "1840213663235485697",
      "paramName": "1",
      "alarmTime": "2024-09-29 10:15:00",
      "alarmInfo": "모니터링 장비 연결 끊김",
      "alarmLevel": "0",
      "area": "성쩌 창고\t",
      "equipment": "Z2QB379B5N",
      "alarmVal": "19.90",
      "count": null,
      "proportion": null,
      "lastCount": null,
      "name": null
    },
    {
      "id": "1840213663235485697",
      "paramName": "1",
      "alarmTime": "2024-09-29 10:15:00",
      "alarmInfo": "모니터링 장비 연결 끊김",
      "alarmLevel": "0",
      "area": "산업단지 창고\t",
      "equipment": "Z2QB379B5N",
      "alarmVal": "19.90",
      "count": null,
      "proportion": null,
      "lastCount": null,
      "name": null
    },
    {
      "id": "1840213663235485697",
      "paramName": "1",
      "alarmTime": "2024-09-29 10:15:00",
      "alarmInfo": "115보관 위치 온도 초과",
      "alarmLevel": "0",
      "area": "성쩌 창고\t",
      "equipment": "Z2QB379B5N",
      "alarmVal": "19.90",
      "count": null,
      "proportion": null,
      "lastCount": null,
      "name": null
    },
  ]
}

function changeAlarmBg(level) {
  switch (level) {
    case '0':
      return 'alarm-normal'
    case '1':
      return 'alarm-warning'
    case '2':
      return 'alarm-danger'
    default:
      break;
  }
}
function getLevel(level) {
  switch (level) {
    case '0':
      return '일반'
    case '1':
      return '긴급'
    case '2':
      return '심각'
    default:
      break;
  }
}

onMounted(()=>{
  getAlarmList()
})
</script>

<style lang='scss' scoped>
.alarmInfo-container {
  width: 100%;
  height: 100%;
  padding: 12px 12px 0;
  font-size: 14px;

  .alarm-item {
    padding: 12px 0;
    border-bottom: 1px solid;
    border-image: linear-gradient(90deg, #00d0fe 0%, #286be9 50%, #00d0fe 100%) 2 2 2 2;;

    .alarm-name {
      // color: var(--current-color);
      font-weight: bold;
      color: #00d0fe;
    }

    .item-level {
      padding: 2px 8px;
      font-size: 13px;
      color: #fff;
      // background: #f56c6c;
      border-radius: 10px 0 10px 0;
    }
    .alarm-normal {
      background: #67c23a;
    }
    .alarm-warning {
      background: #e6a23c;
    }
    .alarm-danger {
      background: #f56c6c;
    }
  }
}
</style>

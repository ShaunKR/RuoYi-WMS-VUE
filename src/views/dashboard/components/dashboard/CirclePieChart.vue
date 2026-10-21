<template>
  <div :class="className" :style="{ height: height, width: width }" ref="circleCharRef"/>
</template>

<script setup>
import * as echarts from "echarts";
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  className: {
    type: String,
    default: "chart",
  },
  width: {
    type: String,
    default: "100%",
  },
  height: {
    type: String,
    default: "300px",
  },
  pieData: {
    type: Array,
    default: function () {
      return [
        { value: 0, name: "정상" },
        { value: 0, name: "경고" },
        { value: 0, name: "연결 끊김" },
      ];
    },
  },
})

const chart = ref(null);
onMounted(()=>{
  nextTick(()=>{
    initChart()
  })
})

const circleCharRef = ref()

onBeforeUnmount(()=>{
  if (!chart.value) {
    return
  }
  chart.value.dispose()
  chart.value = null
})

watch(()=>props.pieData, (value) => {
  nextTick(() => {
    if (!chart.value) {
      return;
    }
    chart.value.dispose();
    chart.value = null;
    initChart();
  });
})

function initChart() {
  chart.value = echarts.init(circleCharRef.value);
  chart.value.setOption({
    tooltip: {
      trigger: 'item',
      // formatter: '{a} <br/>{b} : {c} ({d}%)',
      appendToBody: true,
      backgroundColor: 'rgba(28, 37, 80, 0.8)',
      textStyle: {
        color: '#fff'
      }
    },
    legend: {
      top: "bottom",
      textStyle: {
        color: '#ff'
      },
    },
    grid: {
      left: 5,
      right: 5,
      bottom: '10%',
    },
    series: [
      {
        name: "장비 상태",
        type: "pie",
        radius: [0, '65%'],
        center: ["50%", "40%"],
        roseType: "area",
        itemStyle: {
        },
        label: {
          show: true,
          position: "outside",
          color: '#1be5e7',
          formatter: '{b}({d}%)'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            color: 'data'
          },
        },
        // labelLine: {
        //   show: true,
        // },
        // data: [
        //   { value: 40, name: "正常", itemStyle: {color: '#6be6c3'} },
        //   { value: 38, name: "报警", itemStyle: {color: '#e0c464'} },
        //   { value: 32, name: "离线", itemStyle: {color: '#297ef8'} },
        // ],
        data:props.pieData,
        animationDuration: 1500,
      },
    ],
  });
}


</script>

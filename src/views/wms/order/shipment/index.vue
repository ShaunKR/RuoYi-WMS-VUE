<template>
  <div class="app-container">
    <el-card>
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
        <el-form-item label="출고 상태" prop="orderStatus">
          <el-radio-group v-model="queryParams.orderStatus" @change="handleQuery">
            <el-radio-button
              :key="-2"
              :label="-2"
            >
              전체
            </el-radio-button>
            <el-radio-button
              v-for="item in wms_shipment_status"
              :key="item.value"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="출고 유형" prop="optType">
          <el-radio-group v-model="queryParams.optType" @change="handleQuery">
            <el-radio-button
              :key="-1"
              :label="-1"
            >
              전체
            </el-radio-button>
            <el-radio-button
              v-for="item in wms_shipment_type"
              :key="item.value"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="출고 전표 번호" prop="orderNo">
          <el-input
            v-model="queryParams.orderNo"
            placeholder="출고 전표 번호를 입력해 주세요."
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="업무 번호" prop="bizOrderNo">
          <el-input
            v-model="queryParams.bizOrderNo"
            placeholder="업무 번호를 입력해 주세요."
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">검색</el-button>
          <el-button icon="Refresh" @click="resetQuery">초기화</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt20">

      <el-row :gutter="10" class="mb8" type="flex" justify="space-between">
        <el-col :span="6"><span style="font-size: large">출고 전표</span></el-col>
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['wms:shipment:all']"
          >추가</el-button>
        </el-col>
      </el-row>
      <el-table v-loading="loading" :data="shipmentOrderList" border class="mt20"
                @expand-change="handleExpandExchange"
                :row-key="getRowKey"
                :expand-row-keys="expandedRowKeys"
                empty-text="출고 전표가 없습니다."
                cell-class-name="vertical-top-cell"
      >
        <el-table-column type="expand">
          <template #default="props">
            <div style="padding: 0 50px 20px 50px">
              <h3>상품 상세</h3>
              <el-table :data="props.row.details" v-loading="detailLoading[props.$index]" empty-text="등록된 상품 상세가 없습니다.">
                <el-table-column label="상품명">
                  <template #default="{ row }">
                    <div>{{ row?.item?.itemName }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="규격명">
                  <template #default="{ row }">
                    <div>{{ row?.itemSku?.skuName }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="수량" prop="quantity" align="right">
                  <template #default="{ row }">
                    <el-statistic :value="Number(row.quantity)" :precision="0"/>
                  </template>
                </el-table-column>
                <el-table-column label="금액(위안)" align="right">
                  <template #default="{ row }">
                    <el-statistic v-if="row.amount || row.amount === 0" :precision="2" :value="Number(row.amount)"/>
                    <div v-else>-</div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="전표 번호 / 업무 번호" align="left" min-width="120">
          <template #default="{ row }">
            <div>전표 번호：{{ row.orderNo }}</div>
            <div v-if="row.bizOrderNo">업무 번호：{{ row.bizOrderNo }}</div>
          </template>
        </el-table-column>
        <el-table-column label="창고" align="left">
          <template #default="{ row }">
            <div>{{ useWmsStore().warehouseMap.get(row.warehouseId)?.warehouseName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="총수량 / 총금액(위안)" align="left" min-width="100">
          <template #default="{ row }">
            <div class="flex-space-between">
              <span>수량：</span>
              <el-statistic :value="Number(row.totalQuantity)" :precision="0"/>
            </div>
            <div class="flex-space-between" v-if="row.totalAmount || row.totalAmount === 0">
              <span>금액：</span>
              <el-statistic :value="Number(row.totalAmount)" :precision="2"/>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="출고 상태" align="center" prop="orderStatus" width="80">
          <template #default="{ row }">
            <dict-tag :options="wms_shipment_status" :value="row.orderStatus" />
          </template>
        </el-table-column>
        <el-table-column label="출고 유형" align="center" prop="optType" width="100">
          <template #default="{ row }">
            <dict-tag :options="wms_shipment_type" :value="row.optType" />
          </template>
        </el-table-column>
        <el-table-column label="고객" align="left" prop="merchantId">
          <template #default="{ row }">
            <div>{{ useWmsStore().merchantMap.get(row.merchantId)?.merchantName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="처리 일시" align="left" width="150">
          <template #default="{ row }">
            <div>등록：{{ parseTime(row.createTime, '{mm}-{dd} {hh}:{ii}') }}</div>
            <div>수정：{{ parseTime(row.updateTime, '{mm}-{dd} {hh}:{ii}') }}</div>
          </template>
        </el-table-column>
        <el-table-column label="처리자" align="left">
          <template #default="{ row }">
            <div>{{ row.createBy }}</div>
            <div v-if="row.updateBy">{{ row.updateBy }}</div>
          </template>
        </el-table-column>
        <el-table-column label="비고" prop="remark" />
        <el-table-column label="작업" align="right" class-name="small-padding fixed-width" width="120">
          <template #default="scope">
            <div>
              <el-popover
                placement="left"
                title="안내"
                :width="300"
                trigger="hover"
                :disabled="scope.row.orderStatus === 0"
                :content="'출고 전표【' + scope.row.orderNo + '】 상태: ' + (scope.row.orderStatus === 1 ? '출고' : '무효 처리') + '，상태에서는 수정할 수 없습니다.' "
              >
                <template #reference>
                  <el-button link type="primary" @click="handleUpdate(scope.row)" v-hasPermi="['wms:shipment:all']" :disabled="[-1, 1].includes(scope.row.orderStatus)">수정</el-button>
                </template>
              </el-popover>
              <el-button link type="primary" @click="handleGoDetail(scope.row)" v-hasPermi="['wms:shipment:all']">{{ expandedRowKeys.includes(scope.row.id) ? '접기' : '보기' }}</el-button>
            </div>
            <div class="mt10">
              <el-popover
                placement="left"
                title="안내"
                :width="300"
                trigger="hover"
                :disabled="[-1, 0].includes(scope.row.orderStatus)"
                :content="'출고 전표【' + scope.row.orderNo + '】출고가 완료되어 삭제할 수 없습니다.' "
              >
                <template #reference>
                  <el-button link type="danger" @click="handleDelete(scope.row)" v-hasPermi="['wms:shipment:all']" :disabled="scope.row.orderStatus === 1">삭제</el-button>
                </template>
              </el-popover>
              <el-button link type="primary" @click="handlePrint(scope.row)" v-hasPermi="['wms:shipment:all']">인쇄</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-row>
        <pagination
          v-show="total>0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
        />
      </el-row>
    </el-card>
  </div>
</template>

<script setup name="ShipmentOrder">
import {listShipmentOrder, delShipmentOrder, getShipmentOrder} from "@/api/wms/shipmentOrder";
import {listByShipmentOrderId} from "@/api/wms/shipmentOrderDetail";
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {useWmsStore} from "../../../../store/modules/wms";
import shipmentPanel from "@/components/PrintTemplate/shipment-panel";

const { proxy } = getCurrentInstance();
const { wms_shipment_status, wms_shipment_type} = proxy.useDict("wms_shipment_status", "wms_shipment_type");
const shipmentOrderList = ref([]);
const open = ref(false);
const buttonLoading = ref(false);
const loading = ref(true);
const ids = ref([]);
const total = ref(0);
const title = ref("");
// 当前展开集合
const expandedRowKeys = ref([])
// 商品明细table的loading状态集合
const detailLoading = ref([])
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderNo: undefined,
    optType: -1,
    merchantId: undefined,
    bizOrderNo: undefined,
    totalAmount: undefined,
    orderStatus: -2,
  },
});

const { queryParams } = toRefs(data);

/** 조회입고 전표列表 */
function getList() {
  loading.value = true;
  const query = {...queryParams.value}
  if (query.orderStatus === -2) {
    query.orderStatus = null
  }
  if (query.optType === -1) {
    query.optType = null
  }
  listShipmentOrder(query).then(response => {
    shipmentOrderList.value = response.rows;
    total.value = response.total;
    for (let i = 0; i < total; i++) {
      detailLoading.value.push(false)
    }
    expandedRowKeys.value = []
    loading.value = false;
  });
}

/** 검색버튼작업 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 초기화버튼작업 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 추가버튼작업 */
function handleAdd() {
  proxy.$router.push({ path: "/shipmentOrderEdit" });
}

/** 삭제버튼작업 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('삭제 확인:출고 전표【' + row.orderNo + '】을(를) 삭제하시겠습니까?').then(function() {
    loading.value = true;
    return delShipmentOrder(_ids);
  }).then(() => {
    proxy.$modal.msgSuccess("삭제되었습니다.");
  }).finally(() => {
    loading.value = false;
    getList();
  });
}

function handleUpdate(row) {
  proxy.$router.push({ path: "/shipmentOrderEdit",  query: { id: row.id } });
}

function handleGoDetail(row) {
  const index = expandedRowKeys.value.indexOf(row.id)
  if (index !== -1) {
    // 收起
    expandedRowKeys.value.splice(index, 1)
  } else {
    // 展开
    expandedRowKeys.value.push(row.id)
    loadShipmentOrderDetail(row)
  }
}

/** 내보내기버튼작업 */
async function handlePrint(row) {
  const res = await getShipmentOrder(row.id)
  const shipmentOrder = res.data
  let table = []
  if (shipmentOrder.details?.length) {
    table = shipmentOrder.details.map(detail => {
      return {
        itemName: detail.item.itemName,
        skuName: detail.itemSku.skuName,
        quantity: Number(detail.quantity).toFixed(0),
        amount: detail.amount
      }
    })
  }
  const printData = {
    orderNo: shipmentOrder.orderNo,
    optType: proxy.selectDictLabel(wms_shipment_type.value, shipmentOrder.optType),
    orderStatus: proxy.selectDictLabel(wms_shipment_status.value, shipmentOrder.orderStatus),
    merchantName: useWmsStore().merchantMap.get(shipmentOrder.merchantId)?.merchantName,
    bizOrderNo: shipmentOrder.bizOrderNo,
    warehouseName: useWmsStore().warehouseMap.get(shipmentOrder.warehouseId)?.warehouseName,
    totalQuantity: Number(shipmentOrder.totalQuantity).toFixed(0),
    totalAmount: ((shipmentOrder.totalAmount || shipmentOrder.totalAmount === 0) ? (shipmentOrder.totalAmount + '위안') : ''),
    createBy: shipmentOrder.createBy,
    createTime: proxy.parseTime(shipmentOrder.createTime, '{mm}-{dd} {hh}:{ii}'),
    updateBy: shipmentOrder.updateBy,
    updateTime: proxy.parseTime(shipmentOrder.updateTime, '{mm}-{dd} {hh}:{ii}'),
    remark: shipmentOrder.remark,
    table
  }
  let printTemplate = new proxy.$hiprint.PrintTemplate({template: shipmentPanel})
  printTemplate.print(printData, {}, {
    styleHandler: () => {
      return '<link href="https://cyl-press.oss-cn-shenzhen.aliyuncs.com/print-lock.css" media="print" rel="stylesheet">';
    }
  })
}


function handleExpandExchange(value, expandedRows) {
  if (!ifExpand(expandedRows)) {
    return
  }
  expandedRowKeys.value = expandedRows.map(it => it.id)
  loadShipmentOrderDetail(value)
}

function loadShipmentOrderDetail(row) {
  const index = shipmentOrderList.value.findIndex(it => it.id === row.id)
  detailLoading.value[index] = true
  listByShipmentOrderId(row.id).then(res => {
    if (res.data?.length) {
      const details = res.data.map(it => {
        return {
          ...it,
          warehouseName: useWmsStore().warehouseMap.get(it.warehouseId)?.warehouseName
        }
      })
      shipmentOrderList.value[index].details = details
    }
  }).finally(() => {
    detailLoading.value[index] = false
  })
}

function ifExpand(expandedRows) {
  if (expandedRows.length < expandedRowKeys.value.length) {
    expandedRowKeys.value = expandedRows.map(it => it.id)

    return false;
  }

  return true
}

function getRowKey(row) {
  return row.id
}
getList();
</script>
<style lang="scss">
.el-statistic__content {
  font-size: 14px;
}
.el-table .vertical-top-cell {
  vertical-align: top
}
</style>

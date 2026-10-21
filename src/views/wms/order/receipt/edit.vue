<template>
  <div>
    <div class="receipt-order-edit-wrapper app-container" style="margin-bottom: 60px" v-loading="loading">
      <el-card header="입고 전표 기본 정보">
        <el-form label-width="108px" :model="form" ref="receiptForm" :rules="rules">
          <el-row :gutter="24">
            <el-col :span="11">
              <el-form-item label="입고 전표 번호" prop="orderNo">
                <el-input class="w200" v-model="form.orderNo" placeholder="입고 전표 번호" :disabled="form.id"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="창고" prop="warehouseId">
                <el-select v-model="form.warehouseId" placeholder="창고를 선택해 주세요." filterable>
                  <el-option v-for="item in useWmsStore().warehouseList" :key="item.id" :label="item.warehouseName" :value="item.id"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="총수량" prop="totalQuantity">
                <el-input-number style="width:100%" v-model="form.totalQuantity" :controls="false" :precision="0" :disabled="true"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="11">
              <el-form-item label="입고 유형" prop="optType">
                <el-radio-group v-model="form.optType">
                  <el-radio-button
                    v-for="item in wms_receipt_type"
                    :key="item.value"
                    :label="item.value"
                    >{{ item.label }}</el-radio-button
                  >
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="공급업체" prop="merchantId">
                <el-select v-model="form.merchantId" placeholder="공급업체를 선택해 주세요." clearable filterable>
                  <el-option v-for="item in useWmsStore().merchantList" :key="item.id" :label="item.merchantName" :value="item.id"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="업무 번호" prop="bizOrderNo">
                <el-input v-model="form.bizOrderNo" placeholder="업무 번호를 입력해 주세요."></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="11">
              <el-form-item label="비고" prop="remark">
                <el-input
                  v-model="form.remark"
                  placeholder="비고...100자 이내"
                  rows="4"
                  maxlength="100"
                  type="textarea"
                  show-word-limit="show-word-limit"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <div style="display: flex;align-items: start">
                <el-form-item label="총금액" prop="totalAmount">
                  <el-input-number style="width:100%" v-model="form.totalAmount" :precision="2" :min="0"></el-input-number>
                </el-form-item>
                <el-button link type="primary" @click="handleAutoCalc" style="line-height: 32px">자동 계산</el-button>
              </div>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
      <el-card header="상품 상세" class="mt10">
        <div class="receipt-order-content">
          <div class="flex-space-between mb8">
            <div>
              <span>승인 | 개별 식별 코드：</span>
              <el-switch
                :before-change="goSaasTip"
                class="mr10 ml10"
                inline-prompt
                size="large"
                v-model="mode"
                :active-value="true"
                :inactive-value="false"
                active-text="켜기"
                inactive-text="닫기"
              />
            </div>
            <el-popover
              placement="left"
              title="안내"
              :width="200"
              trigger="hover"
              :disabled="form.warehouseId"
              content="창고를 먼저 선택해 주세요."
            >
              <template #reference>
                <el-button type="primary" plain="plain" size="default" @click="showAddItem" icon="Plus" :disabled="!form.warehouseId">상품 추가</el-button>
              </template>
            </el-popover>
          </div>
          <el-table :data="form.details" border empty-text="등록된 상품 상세가 없습니다.">
            <el-table-column label="상품 정보" prop="itemSku.itemName">
              <template #default="{ row }">
                <div>{{ row.item.itemName + (row.item.itemCode ? ('(' + row.item.itemCode + ')') : '') }}</div>
                <div v-if="row.item.itemBrand">브랜드：{{ useWmsStore().itemBrandMap.get(row.item.itemBrand).brandName }}</div>
              </template>
            </el-table-column>
            <el-table-column label="규격 정보">
              <template #default="{ row }">
                <div>{{ row.itemSku.skuName }}</div>
                <div v-if="row.itemSku.barcode">바코드：{{row.itemSku.barcode}}</div>
              </template>
            </el-table-column>
            <el-table-column label="수량" prop="quantity" width="180">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.quantity"
                  placeholder="수량"
                  :min="1"
                  :precision="0"
                  @change="handleChangeQuantity"
                ></el-input-number>
              </template>
            </el-table-column>
            <el-table-column label="금액" prop="amount" width="180">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.amount"
                  placeholder="금액"
                  :precision="2"
                  :min="0"
                  :max="2147483647"
                ></el-input-number>
              </template>
            </el-table-column>
            <el-table-column label="작업" width="100" align="right" fixed="right">
              <template #default="scope">
                <el-button icon="Delete" type="danger" plain size="small" @click="handleDeleteDetail(scope.row, scope.$index)" link>삭제</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
      <SkuSelect
        ref="skuSelectRef"
        :model-value="skuSelectShow"
        :selected-sku="selectedSku"
        @handleOkClick="handleOkClick"
        @handleCancelClick="skuSelectShow = false"
        :size="'80%'"
      />
    </div>
    <div class="footer-global">
      <div class="btn-box">
        <div>
          <el-button @click="doWarehousing" type="primary" class="ml10">입고 확정</el-button>
          <el-button @click="updateToInvalid" type="danger" v-if="form.id">무효 처리</el-button>
        </div>
        <div>
          <el-button @click="save" type="primary">임시 저장</el-button>
          <el-button @click="cancel" class="mr10">취소</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="ReceiptOrderEdit">
import {computed, getCurrentInstance, onMounted, reactive, ref, toRef, toRefs, watch} from "vue";
import {addReceiptOrder, getReceiptOrder, updateReceiptOrder, warehousing} from "@/api/wms/receiptOrder";
import {ElMessage, ElMessageBox} from "element-plus";
import SkuSelect from "../../../components/SkuSelect.vue";
import {useRoute} from "vue-router";
import {useWmsStore} from '@/store/modules/wms'
import { numSub, generateNo } from '@/utils/ruoyi'
import { delReceiptOrderDetail } from '@/api/wms/receiptOrderDetail'
import {getWarehouseAndSkuKey} from "@/utils/wmsUtil";

const {proxy} = getCurrentInstance();
const { wms_receipt_type } = proxy.useDict("wms_receipt_type");
const selectedSku = ref([])
const mode = ref(false)
const loading = ref(false)
const skuSelectRef = ref(null)
const initFormData = {
  id: undefined,
  orderNo: undefined,
  optType: "2",
  merchantId: undefined,
  bizOrderNo: undefined,
  totalAmount: undefined,
  orderStatus: 0,
  remark: undefined,
  warehouseId: undefined,
  totalQuantity: 0,
  details: [],
}
const data = reactive({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderNo: undefined,
    optType: undefined,
    bizOrderNo: undefined,
    totalAmount: undefined,
    orderStatus: undefined,
  },
  rules: {
    orderNo: [
      {required: true, message: "입고 전표 번호를 입력해 주세요.", trigger: "blur"}
    ],
    warehouseId: [
      {required: true, message: "창고를 선택해 주세요.", trigger: ['blur', 'change']}
    ]
  }
});
const { form, rules} = toRefs(data);

const cancel = async () => {
  await proxy?.$modal.confirm('입고 전표 편집을 취소하시겠습니까?');
  close()
}
const close = () => {
  const obj = {path: "/receiptOrder"};
  proxy?.$tab.closeOpenPage(obj);
}
const skuSelectShow = ref(false)

// 选择商品 start
const showAddItem = () => {
  skuSelectRef.value.getList()
  skuSelectShow.value = true
}
// 选择成功
const handleOkClick = (item) => {
  skuSelectShow.value = false
  selectedSku.value = [...item]
  item.forEach((it) => {
    if (!form.value.details.find(detail => detail.itemSku.id === it.id)) {
      form.value.details.push(
        {
          itemSku: it.itemSku,
          item: it.item,
          amount: undefined,
          quantity: it.quantity,
          warehouseId: form.value.warehouseId
        }
      )
    }
  })
}
// 选择商品 end

// 初始化receipt-order-form ref
const receiptForm = ref()

const save = async () => {
  await proxy?.$modal.confirm('입고 전표를 임시 저장하시겠습니까?');
  doSave()
}

const getParamsBeforeSave = (orderStatus) => {
  let details = []
  if (form.value.details?.length) {
    details = form.value.details.map(it => {
      return {
        id: it.id,
        skuId: it.itemSku.id,
        amount: it.amount,
        quantity: it.quantity,
        warehouseId: form.value.warehouseId,
      }
    })
  }

  return {
    id: form.value.id,
    orderNo: form.value.orderNo,
    orderStatus,
    optType: form.value.optType,
    merchantId: form.value.merchantId,
    bizOrderNo: form.value.bizOrderNo,
    remark: form.value.remark,
    totalAmount: form.value.totalAmount,
    totalQuantity: form.value.totalQuantity,
    warehouseId: form.value.warehouseId,
    details: details
  }
}

const doSave = async (orderStatus = 0) => {
  //验证receiptForm表单
  receiptForm.value?.validate((valid) => {
    // 校验
    if (!valid) {
      return ElMessage.error('필수 항목을 입력해 주세요.')
    }
    const params = getParamsBeforeSave(orderStatus)
    loading.value = true
    if (params.id) {
      updateReceiptOrder(params).then((res) => {
        if (res.code === 200) {
          ElMessage.success(res.msg)
          close()
        } else {
          ElMessage.error(res.msg)
        }
      }).finally(() => {
        loading.value = false
      })
    } else {
      addReceiptOrder(params).then((res) => {
        if (res.code === 200) {
          ElMessage.success(res.msg)
          close()
        } else {
          ElMessage.error(res.msg)
        }
      }).finally(() => {
        loading.value = false
      })
    }
  })
}

const doWarehousing = async () => {
  await proxy?.$modal.confirm('입고를 확정하시겠습니까?');
  receiptForm.value?.validate((valid) => {
    // 校验
    if (!valid) {
      return ElMessage.error('필수 항목을 입력해 주세요.')
    }

    if (!form.value.details?.length) {
      return ElMessage.error('상품을 선택해 주세요.')
    }
    if (form.value.details?.length) {
      const invalidQuantityList = form.value.details.filter(it => !it.quantity)
      if (invalidQuantityList?.length) {
        return ElMessage.error('수량을 선택해 주세요.')
      }
    }
    const params = getParamsBeforeSave(1);
    loading.value = true
    warehousing(params).then((res) => {
      if (res.code === 200) {
        ElMessage.success('입고가 완료되었습니다.')
        close()
      } else {
        ElMessage.error(res.msg)
      }
    }).finally(() => {
      loading.value = false
    })
  })
}

const updateToInvalid = async () => {
  await proxy?.$modal.confirm('입고 전표를 무효 처리하시겠습니까?');
  doSave(-1)
}

const route = useRoute();
onMounted(() => {
  const id = route.query && route.query.id;
  if (id) {
    loadDetail(id)
  } else {
    form.value.orderNo = 'RK' + generateNo()
  }
})


// 获取入库单详情
const loadDetail = (id) => {
  loading.value = true
  getReceiptOrder(id).then((response) => {
    form.value = {...response.data}
    if (response.data.details?.length) {
      selectedSku.value = response.data.details.map(it => {
        return {
          id: it.skuId
        }
      })
    }
    Promise.resolve();
  }).then(() => {
  }).finally(() => {
    loading.value = false
  })
}

const handleChangeQuantity = () => {
  let sum = 0
  form.value.details.forEach(it => {
    if (it.quantity) {
      sum += Number(it.quantity)
    }
  })
  form.value.totalQuantity = sum
}

const handleAutoCalc = () => {
  let sum = undefined
  form.value.details.forEach(it => {
    if (it.amount >= 0) {
      if (!sum) {
        sum = 0
      }
      sum = numSub(sum, -Number(it.amount))
    }
  })
  form.value.totalAmount = sum
}

const handleDeleteDetail = (row, index) => {
  if (row.id) {
    proxy.$modal.confirm('이 상품 상세를 삭제하시겠습니까? 확인하면 즉시 삭제됩니다.').then(function () {
      loading.value = true
      return delReceiptOrderDetail(row.id);
    }).then(() => {
      form.value.details.splice(index, 1)
      proxy.$modal.msgSuccess("삭제되었습니다.");
    }).finally(() => {
      loading.value = false
    });
  } else {
    form.value.details.splice(index, 1)
  }
  const indexOfSelected = selectedSku.value.findIndex(it => row.itemSku.id=== it.id)
  selectedSku.value.splice(indexOfSelected, 1)
}
const goSaasTip = () => {
  ElMessageBox.alert('이 기능은 원본 프로젝트의 SaaS 버전에서 제공됩니다.', 'SaaS 기능 안내', {
    confirmButtonText: '확인'
  })
  return false
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.module";

.btn-box {
  width: calc(100% - #{$base-sidebar-width});
  display: flex;
  align-items: center;
  justify-content: space-between;
  float: right;
}
</style>

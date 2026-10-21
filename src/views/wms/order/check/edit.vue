<template>
  <div v-if="!checking" style="display: flex;justify-content: center;align-items: center;height: 80vh">
    <el-card header="창고를 선택한 후 재고 실사를 시작하세요." >
      <el-form>
        <el-form-item label="창고" prop="warehouseId">
          <el-select v-model="form.warehouseId" placeholder="창고를 선택해 주세요." :disabled="checking"
                     filterable>
            <el-option v-for="item in useWmsStore().warehouseList" :key="item.id" :label="item.warehouseName"
                       :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" plain="plain" size="default" @click="startCheck"  style="width: 100%!important;">재고 실사 시작</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
  <div v-else v-loading="loading">
    <div class="receipt-order-edit-wrapper app-container" style="margin-bottom: 60px">
      <el-card header="실사 전표 기본 정보">
        <el-form label-width="108px" :model="form" ref="checkForm" :rules="rules">
          <el-row :gutter="24">
            <el-col :span="11">
              <el-form-item label="실사 전표 번호" prop="orderNo">
                <el-input class="w200" v-model="form.orderNo" placeholder="실사 전표 번호"
                          :disabled="form.id"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="창고" prop="warehouseId">
                <el-select v-model="form.warehouseId" placeholder="창고를 선택해 주세요." :disabled="checking"
                           filterable>
                  <el-option v-for="item in useWmsStore().warehouseList" :key="item.id" :label="item.warehouseName"
                             :value="item.id"/>
                </el-select>
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
              <el-form-item label="재고 차이" prop="totalQuantity">
                <el-input-number v-model="form.totalQuantity" :controls="false" :precision="0"
                                 :disabled="true"></el-input-number>
              </el-form-item>
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
                :active-value="true"
                :inactive-value="false"
                active-text="켜기"
                inactive-text="닫기"
              />
            </div>
                  <el-button type="primary" plain="plain" size="default" @click="showSkuSelect" icon="Plus"
                             :disabled="!form.warehouseId">재고 추가
                  </el-button>
          </div>
          <el-table :data="form.details" border empty-text="등록된 상품 상세가 없습니다.">
            <el-table-column label="상품 정보" prop="itemSku.itemName">
              <template #default="scope">
                  <div>{{
                      scope.row.item.itemName + (scope.row.item.itemCode ? ('(' + scope.row.item.itemCode + ')') : '')
                    }}
                  </div>
                  <div v-if="scope.row.item.itemBrand">
                    브랜드：{{ useWmsStore().itemBrandMap.get(scope.row.item.itemBrand).brandName }}
                  </div>
                </template>
            </el-table-column>
            <el-table-column label="규격 정보">
              <template #default="{ row }">
                <template v-if="row.newInventoryDetail">
                  <div v-if="row.itemSku">{{ row.itemSku.skuName + (row.itemSku.barcode ? ('(' + row.itemSku.barcode + ')') : '') }}</div>
                  <div v-else>상품을 선택해 주세요.</div>
                </template>
                <template v-else>
                  <div>{{ row.itemSku.skuName + (row.itemSku.barcode ? ('(' + row.itemSku.barcode + ')') : '') }}</div>
                </template>
              </template>
            </el-table-column>
            <el-table-column label="장부 재고" align="right" width="150">
              <template #default="{ row }">
                <el-statistic :value="Number(row.quantity)" :precision="0"/>
              </template>
            </el-table-column>
            <el-table-column label="재고 차이" prop="remainQuantity" align="right" width="150">
              <template #default="{ row }">
                <el-statistic :value="Number(row.checkQuantity) - Number(row.quantity)" :precision="0"/>
              </template>
            </el-table-column>
            <el-table-column label="실제 재고" prop="checkQuantity" width="180">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.checkQuantity"
                  placeholder="실제 재고"
                  :min="0"
                  :precision="0"
                  @change="handleChangeQuantity"
                ></el-input-number>
              </template>
            </el-table-column>
            <el-table-column label="작업" width="100" align="center">
              <template #default="scope">
                <el-button icon="Delete" type="danger" plain size="small" v-if="scope.row.newInventory"
                           @click="handleDeleteDetail(scope.row, scope.$index)" link>삭제
                </el-button>
                <div v-else> - </div>
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
    <div class="footer-global" v-if="checking">
      <div class="btn-box">
        <div>
          <el-button @click="doCheck" type="primary" class="ml10">실사 확정</el-button>
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

<script setup name="CheckOrderEdit">
import {computed, getCurrentInstance, onMounted, reactive, ref, toRef, toRefs, watch} from "vue";
const skuSelectRef = ref(null)
import {addCheckOrder, getCheckOrder, updateCheckOrder, check} from "@/api/wms/checkOrder";
import {delCheckOrderDetail} from "@/api/wms/checkOrderDetail";
import {listInventoryNoPage} from "@/api/wms/inventory";
import {ElMessage, ElMessageBox} from "element-plus";
import {useRoute} from "vue-router";
import {useWmsStore} from '@/store/modules/wms'
import {numSub, generateNo} from '@/utils/ruoyi'
import SkuSelect from "@/views/components/SkuSelect.vue";

const {proxy} = getCurrentInstance();
const {wms_shipment_type} = proxy.useDict("wms_shipment_type");
const loading = ref(false)
const selectedSku = ref([])
const initFormData = {
  id: undefined,
  orderNo: undefined,
  orderStatus: 0,
  remark: undefined,
  warehouseId: undefined,
  totalQuantity: 0,
  details: [],
}
const data = reactive({
  form: {...initFormData},
  rules: {
    orderNo: [
      {required: true, message: "실사 전표 번호를 입력해 주세요.", trigger: "blur"}
    ],
    warehouseId: [
      {required: true, message: "창고를 선택해 주세요.", trigger: ['blur', 'change']}
    ],
  }
});
const {form, rules} = toRefs(data);
const cancel = async () => {
  await proxy?.$modal.confirm('실사 전표 편집을 취소하시겠습니까?');
  close()
}
const close = () => {
  const obj = {path: "/checkOrder"};
  proxy?.$tab.closeOpenPage(obj);
}
const inventorySelectShow = ref(false)
const skuSelectShow = ref(false)
const currentSkuSelectIndex = ref(null)
// 盘库中标识
const checking = ref(false)

// 选择商品 start
const startCheck = () => {
  if (!form.value.warehouseId) {
    return ElMessage.error('창고를 먼저 선택해 주세요.')
  }
  const query = {
    warehouseId: form.value.warehouseId,
  }
  checking.value = true
  loading.value = true
  listInventoryNoPage(query).then(res => {
    selectedSku.value = res.data.map(it => {
      return {
        id: it.skuId
      }
    })
    res.data.forEach(it => {
        form.value.details.push({
            itemSku: it.itemSku,
            item: it.item,
            inventoryId: it.id,
            skuId: it.itemSku.id,
            warehouseId: it.warehouseId,
            quantity: Number(it.quantity),
            checkQuantity: Number(it.quantity),
            newInventory: false
          }
        )
    })
  }).finally(() => loading.value = false)
}
// 选择成功
const handleOkClick = (item) => {
  skuSelectShow.value = false
  selectedSku.value = [...item]
  item.forEach(it => {
    if (!form.value.details.find(detail => detail.itemSku.id === it.id)) {
      form.value.details.push(
        {
          itemSku: it.itemSku,
          item: it.item,
          skuId: it.id,
          warehouseId: form.value.warehouseId,
          inventoryId: null,
          quantity: 0,
          checkQuantity: 0,
          newInventory: true
        })
    }
  })
}

const showSkuSelect = () => {
  skuSelectRef.value.getList()
  skuSelectShow.value = true
}
// 选择商品 end

// 初始化receipt-order-form ref
const checkForm = ref()

const save = async () => {
  await proxy?.$modal.confirm('실사 전표를 임시 저장하시겠습니까?');
  doSave()
}
const getParams = (orderStatus) => {
  let details = []
  if (form.value.details?.length) {
    // 构建参数
    details = form.value.details.map(it => {
      return {
        id: it.id,
        orderId: form.value.id,
        skuId: it.skuId,
        quantity: it.quantity,
        checkQuantity: it.checkQuantity,
        inventoryId: it.inventoryId,
        warehouseId: form.value.warehouseId,
      }
    })
  }
  return  {
    id: form.value.id,
    orderNo: form.value.orderNo,
    orderStatus,
    remark: form.value.remark,
    totalQuantity: form.value.totalQuantity,
    warehouseId: form.value.warehouseId,
    details: details
  }
}
const doSave = (orderStatus = 0) => {
  //验证shipmentForm表单
  checkForm.value?.validate((valid) => {
    // 校验
    if (!valid) {
      return ElMessage.error('필수 항목을 입력해 주세요.')
    }
    const params = getParams(orderStatus);
    loading.value = true
    if (params.id) {
      updateCheckOrder(params).then((res) => {
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
      addCheckOrder(params).then((res) => {
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


const updateToInvalid = async () => {
  await proxy?.$modal.confirm('실사 전표를 무효 처리하시겠습니까?');
  doSave(-1)
}

const doCheck = async () => {
  await proxy?.$modal.confirm('재고 실사를 완료하시겠습니까?');
  checkForm.value?.validate((valid) => {
    // 校验
    if (!valid) {
      return ElMessage.error('필수 항목을 입력해 주세요.')
    }
    loading.value = true
    const params = getParams(1);
    check(params).then((res) => {
      if (res.code === 200) {
        ElMessage.success('재고 실사가 완료되었습니다.')
        close()
      } else {
        ElMessage.error(res.msg)
      }
    }).finally(() => {
      loading.value = false
    })
  })
}

const route = useRoute();
onMounted(() => {
  const id = route.query && route.query.id;
  if (id) {
    checking.value = true
    loadDetail(id)
  } else {
    form.value.orderNo = 'PK' + generateNo()
  }
})


// 获取入库单详情
const loadDetail = (id) => {
  loading.value = true
  getCheckOrder(id).then((response) => {
    if (response.data.details?.length) {
      response.data.details.forEach(detail => {
        detail.newInventory = !detail.inventoryId
      })
      selectedSku.value = response.data.details.map(it => {
        return {
          id: it.skuId
        }
      })
    }
    form.value = {...response.data}
    Promise.resolve();
  }).then(() => {
  }).finally(() => {
    loading.value = false
  })
}

const handleDeleteDetail = (row, index) => {
  if (row.id) {
    proxy.$modal.confirm('이 상품 상세를 삭제하시겠습니까? 확인하면 즉시 삭제됩니다.').then(function () {
      return delCheckOrderDetail(row.id);
    }).then(() => {
      form.value.details.splice(index, 1)
      proxy.$modal.msgSuccess("삭제되었습니다.");
    })
  } else {
    form.value.details.splice(index, 1)
  }
  const indexOfSelected = selectedSku.value.findIndex(it => row.itemSku.id=== it.id)
  selectedSku.value.splice(indexOfSelected, 1)
}

const handleChangeQuantity = () => {
  let totalQuantity = 0
  form.value.details.forEach(it => {
    if (it.quantity !== it.checkQuantity) {
      totalQuantity += (it.checkQuantity - it.quantity)
    }
  })
  form.value.totalQuantity = totalQuantity
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

.el-statistic__content {
  font-size: 14px;
}
.hover-text {
  color: black; /* 初始文字颜色 */
  text-decoration: none; /* 初始没有下划线 */
  transition: color 0.3s, text-decoration 0.3s; /* 平滑过渡效果 */
}

.hover-text:hover {
  color: #409EFF; /* 鼠标移上去时文字颜色变: 蓝色 */
  text-decoration: underline; /* 鼠标移上去时带有下划线 */
}
</style>

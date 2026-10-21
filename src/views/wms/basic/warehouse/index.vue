<template>
  <div class="app-container">
    <el-card>

      <el-row :gutter="10" class="mb8" type="flex" justify="space-between">
        <el-col :span="6"><span style="font-size: large">창고 목록</span></el-col>
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['wms:itemBrand:add']"
          >추가</el-button>
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="warehouseList" border class="mt20" empty-text="등록된 브랜드가 없습니다.">
        <el-table-column label="창고명" prop="warehouseName" />
        <el-table-column label="창고 코드" prop="warehouseCode" />
        <el-table-column label="등록 일시" prop="createTime" width="180"/>
        <el-table-column label="작업" align="right" class-name="small-padding fixed-width" width="180">
          <template #default="scope">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['wms:itemBrand:edit']">수정</el-button>
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['wms:itemBrand:remove']">삭제</el-button>
          </template>
        </el-table-column>
      </el-table>

    </el-card>
    <!-- 添加或修改仓库对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body :close-on-click-modal="false">
      <el-form ref="warehouseFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="이름" prop="warehouseName">
          <el-input v-model="form.warehouseName" placeholder="이름을 입력해 주세요." />
        </el-form-item>
        <el-form-item label="코드" prop="warehouseCode">
          <el-input v-model="form.warehouseCode" placeholder="코드를 입력해 주세요." />
        </el-form-item>
        <el-form-item label="비고" prop="remark">
          <el-input v-model="form.remark" placeholder="비고를 입력해 주세요." />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">확인</el-button>
          <el-button @click="cancel">취소</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Warehouse">
import {
  getWarehouse,
  delWarehouse,
  addWarehouse,
  updateWarehouse,
  listWarehouseNoPage
} from '@/api/wms/warehouse';
import {getCurrentInstance, nextTick, onMounted, reactive, ref, toRefs} from 'vue';
import {ElForm, ElMessageBox, ElTree} from 'element-plus';
import useUserStore from "@/store/modules/user";
import {useWmsStore} from "@/store/modules/wms";
const wmsStore = useWmsStore();
const { proxy } = getCurrentInstance();

const customNodeClass = (data, node) => {
  if (data.warehouseCode) {
    return 'warehouseCode';
  }
  return null
}
const warehouseList = ref([]);
const buttonLoading = ref(false);
const loading = ref(false);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const queryFormRef = ref(ElForm);
const warehouseFormRef = ref(ElForm);
const dialog = reactive({
  visible: false,
  title: ''
});
const initFormData = {
  id: undefined,
  warehouseCode: undefined,
  warehouseName: undefined,
  remark: undefined,
}
const data = reactive({
  form: {...initFormData},
  queryParams: {
    warehouseCode: undefined,
    warehouseName: undefined,
  },
  rules: {
    id: [
      { required: true, message: "항목은 필수입니다.", trigger: "blur" }
    ],
    warehouseName: [
      { required: true, message: "이름을 입력해 주세요.", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);


const selectedWarehouseId = ref()


/** 조회창고 목록 */
const getList = async () => {
  loading.value = true;
  const res = await listWarehouseNoPage(queryParams.value).finally(()=>{
    loading.value = false;
  });
  warehouseList.value = res.data;
  total.value = res.total;
}

/** 취소버튼 */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** 表单초기화 */
const reset = () => {
  form.value = {...initFormData};
  warehouseFormRef.value.resetFields();
}

/** 검색버튼작업 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** 초기화버튼작업 */
const resetQuery = () => {
  queryFormRef.value.resetFields();
  handleQuery();
}

// /** 多选框选中数据

/** 추가버튼작업 */
const handleAdd = async () => {

      dialog.visible = true;
      dialog.title = "창고 추가";
      nextTick(() => {
        reset();
      });
}

/** 수정버튼작업 */
const handleUpdate = (data) => {
  dialog.visible = true;
  dialog.title = "창고 수정";
  nextTick(async () => {
    reset();
    const _id = data.id
    const res = await getWarehouse(_id);
    Object.assign(form.value, res.data);
  });
}

/** 저장버튼 */
const submitForm = () => {
  warehouseFormRef.value.validate(async (valid) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateWarehouse(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addWarehouse(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess(form.value.id ? '수정되었습니다.' : '등록되었습니다.');
      dialog.visible = false;
      await getList();
      wmsStore.getWarehouseList()
    }
  });
}

/** 삭제버튼작업 */
const handleDelete = async (data) => {
  const _ids = data.id;
  await proxy?.$modal.confirm('삭제 확인:창고【' + data.warehouseName + '】을(를) 삭제하시겠습니까?').finally(() => loading.value = false);
  await delWarehouse(_ids);
  proxy?.$modal.msgSuccess("삭제되었습니다.");
  await getList();
  wmsStore.getWarehouseList()
}

/** 내보내기버튼작업 */
const handleExport = () => {
  proxy?.download('wms/warehouse/export', {
    ...queryParams.value
  }, `warehouse_${new Date().getTime()}.xlsx`)
}
onMounted(async () => {
  await getList();
});
</script>
<style lang="scss">
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
.el-tree-node__content {
  display: flex;
  align-items: center;
  height: 35px;
  cursor: pointer;
}
.el-message-box__content {
  font-size: 16px;
}
</style>

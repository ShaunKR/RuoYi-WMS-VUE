<template>
  <div class="app-container">
    <el-card>
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
        <el-form-item label="브랜드명" prop="brandName">
          <el-input
            v-model="queryParams.brandName"
            placeholder="브랜드명을 입력해 주세요."
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
        <el-col :span="6"><span style="font-size: large">브랜드 목록</span></el-col>
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

      <el-table v-loading="loading" :data="itemBrandList" border class="mt20" empty-text="등록된 브랜드가 없습니다.">
        <el-table-column label="브랜드명" prop="brandName" />
        <el-table-column label="등록 일시" prop="createTime" width="180"/>
        <el-table-column label="작업" align="right" class-name="small-padding fixed-width" width="180">
          <template #default="scope">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['wms:itemBrand:edit']">수정</el-button>
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['wms:itemBrand:remove']">삭제</el-button>
          </template>
        </el-table-column>
      </el-table>

    </el-card>
    <!-- 添加或修改商品品牌对话框 -->
    <el-drawer :title="title" v-model="open" size="50%" append-to-body>
      <el-form ref="itemBrandRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="브랜드명" prop="brandName">
          <el-input v-model="form.brandName" placeholder="브랜드명을 입력해 주세요." />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">확인</el-button>
          <el-button @click="cancel">취소</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup name="ItemBrand">
import { listItemBrand, getItemBrand, delItemBrand, addItemBrand, updateItemBrand, listItemBrandPage } from "@/api/wms/itemBrand";
import {ElMessageBox} from "element-plus";
import {useWmsStore} from '@/store/modules/wms'

const { proxy } = getCurrentInstance();

const itemBrandList = ref([]);
const open = ref(false);
const buttonLoading = ref(false);
const loading = ref(true);
const ids = ref([]);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    brandName: undefined,
  },
  rules: {
    id: [
      { required: true, message: "항목은 필수입니다.", trigger: "blur" }
    ],
    brandName: [
      { required: true, message: "브랜드명을 입력해 주세요.", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 조회상품 브랜드列表 */
async function getList() {
  loading.value = true;
  await useWmsStore().getItemBrandList()
  let list = [...useWmsStore().itemBrandList]
  if (queryParams.value.brandName) {
    list = list.filter(it => it.brandName === queryParams.value.brandName)
  }
  itemBrandList.value = list;
  loading.value = false;
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    brandName: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("itemBrandRef");
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
  reset();
  open.value = true;
  title.value = "브랜드 추가";
}

/** 수정버튼작업 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getItemBrand(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "브랜드 수정";
  });
}

/** 저장버튼 */
function submitForm() {
  proxy.$refs["itemBrandRef"].validate(valid => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id != null) {
        updateItemBrand(form.value).then(response => {
          proxy.$modal.msgSuccess("수정되었습니다.");
          open.value = false;
          getList();
        }).finally(() => {
          buttonLoading.value = false;
        });
      } else {
        addItemBrand(form.value).then(response => {
          proxy.$modal.msgSuccess("등록되었습니다.");
          open.value = false;
          getList();
        }).finally(() => {
          buttonLoading.value = false;
        });
      }
    }
  });
}

/** 삭제버튼작업 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('삭제 확인:브랜드【' + row.brandName + '】을(를) 삭제하시겠습니까?').then(function() {
    return delItemBrand(_ids);
  }).then(() => {
    loading.value = true;
    getList();
    proxy.$modal.msgSuccess("삭제되었습니다.");
  }).finally(() => {
    loading.value = false;
  });
}

/** 내보내기버튼작업 */
function handleExport() {
  proxy.download('wms/itemBrand/export', {
    ...queryParams.value
  }, `itemBrand_${new Date().getTime()}.xlsx`)
}

getList();
</script>

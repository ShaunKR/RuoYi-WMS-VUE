<template>
  <div class="app-container">
    <el-card>
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
        <el-form-item label="코드" prop="merchantCode">
          <el-input
            v-model="queryParams.merchantCode"
            placeholder="코드를 입력해 주세요."
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="이름" prop="merchantName">
          <el-input
            v-model="queryParams.merchantName"
            placeholder="이름을 입력해 주세요."
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="거래처 유형" prop="merchantType">
          <el-select v-model="queryParams.merchantType" placeholder="거래처 유형을 선택해 주세요." clearable>
            <el-option
              v-for="dict in merchant_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">검색</el-button>
          <el-button icon="Refresh" @click="resetQuery">초기화</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt20">

      <el-row :gutter="10" class="mb8" type="flex" justify="space-between">
        <el-col :span="6"><span style="font-size: large">거래처</span></el-col>
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['wms:merchant:add']"
          >추가</el-button>
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="merchantList" border class="mt20" empty-text="등록된 거래처가 없습니다.">
        <el-table-column label="id" prop="id" v-if="false"/>
        <el-table-column label="코드" prop="merchantCode" />
        <el-table-column label="이름" prop="merchantName" />
        <el-table-column label="거래처 유형" prop="merchantType">
          <template #default="scope">
            <dict-tag :options="merchant_type" :value="scope.row.merchantType"/>
          </template>
        </el-table-column>
        <el-table-column label="등급" prop="merchantLevel" />
        <el-table-column label="담당자" prop="contactPerson" />
        <el-table-column label="비고" prop="remark" />
        <el-table-column label="작업" align="right" class-name="small-padding fixed-width">
            <template #default="scope">
                <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['wms:merchant:edit']">수정</el-button>
                <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['wms:merchant:remove']">삭제</el-button>
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
    <!-- 添加或修改往来单位对话框 -->
    <el-drawer :title="title" v-model="open" append-to-body size="50%">
      <el-form ref="merchantRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="코드" prop="merchantCode">
          <el-input v-model="form.merchantCode" placeholder="코드를 입력해 주세요." />
        </el-form-item>
        <el-form-item label="이름" prop="merchantName">
          <el-input v-model="form.merchantName" placeholder="이름을 입력해 주세요." />
        </el-form-item>
        <el-form-item label="거래처 유형" prop="merchantType">
          <el-select v-model="form.merchantType" placeholder="거래처 유형을 선택해 주세요.">
            <el-option
              v-for="dict in merchant_type"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="등급" prop="merchantLevel">
          <el-input v-model="form.merchantLevel" placeholder="등급을 입력해 주세요." />
        </el-form-item>
        <el-form-item label="은행명" prop="bankName">
          <el-input v-model="form.bankName" placeholder="은행명을 입력해 주세요." />
        </el-form-item>
        <el-form-item label="계좌번호" prop="bankAccount">
          <el-input v-model="form.bankAccount" placeholder="계좌번호를 입력해 주세요." />
        </el-form-item>
        <el-form-item label="주소" prop="address">
          <el-input v-model="form.address" placeholder="주소를 입력해 주세요." />
        </el-form-item>
        <el-form-item label="휴대전화" prop="mobile">
          <el-input v-model="form.mobile" placeholder="휴대전화 번호를 입력해 주세요." />
        </el-form-item>
        <el-form-item label="전화번호" prop="tel">
          <el-input v-model="form.tel" placeholder="전화번호를 입력해 주세요." />
        </el-form-item>
        <el-form-item label="담당자" prop="contactPerson">
          <el-input v-model="form.contactPerson" placeholder="담당자를 입력해 주세요." />
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" placeholder="입력해 주세요:Email" />
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
    </el-drawer>
  </div>
</template>

<script setup name="Merchant">
import { listMerchant, getMerchant, delMerchant, addMerchant, updateMerchant } from "@/api/wms/merchant";
import {ElMessageBox} from "element-plus";

const { proxy } = getCurrentInstance();
const { merchant_type } = proxy.useDict('merchant_type');

const merchantList = ref([]);
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
    merchantCode: undefined,
    merchantName: undefined,
    merchantType: undefined,
  },
  rules: {
    merchantCode: [
      { required: true, message: "코드를 입력해 주세요.", trigger: "blur" }
    ],
    merchantName: [
      { required: true, message: "이름을 입력해 주세요.", trigger: "blur" }
    ],
    merchantType: [
      { required: true, message: "거래처 유형을 선택해 주세요.", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 조회거래처列表 */
function getList() {
  loading.value = true;
  listMerchant(queryParams.value).then(response => {
    merchantList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
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
    merchantCode: null,
    merchantName: null,
    merchantType: null,
    merchantLevel: null,
    bankName: null,
    bankAccount: null,
    address: null,
    mobile: null,
    tel: null,
    contactPerson: null,
    email: null,
    remark: null,
    delFlag: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("merchantRef");
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
  title.value = "거래처 추가";
}

/** 수정버튼작업 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getMerchant(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "거래처 수정";
  });
}

/** 저장버튼 */
function submitForm() {
  proxy.$refs["merchantRef"].validate(valid => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id != null) {
        updateMerchant(form.value).then(response => {
          proxy.$modal.msgSuccess("수정되었습니다.");
          open.value = false;
          getList();
        }).finally(() => {
          buttonLoading.value = false;
        });
      } else {
        addMerchant(form.value).then(response => {
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
  proxy.$modal.confirm('삭제 확인:거래처【' + row.merchantName + '】을(를) 삭제하시겠습니까?').then(function() {
    return delMerchant(_ids);
  }).then((res) => {
    loading.value = true;
    getList();
    proxy.$modal.msgSuccess("삭제되었습니다.");
  }).finally(() => {
    loading.value = false;
  });
}

/** 내보내기버튼작업 */
function handleExport() {
  proxy.download('wms/merchant/export', {
    ...queryParams.value
  }, `merchant_${new Date().getTime()}.xlsx`)
}

getList();
</script>

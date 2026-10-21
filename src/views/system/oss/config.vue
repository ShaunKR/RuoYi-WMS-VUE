<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="설정key" prop="configKey">
        <el-input
          v-model="queryParams.configKey"
          placeholder="설정key"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="버킷명" prop="bucketName">
        <el-input
          v-model="queryParams.bucketName"
          placeholder="입력해 주세요:버킷명"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="기본 여부" prop="status">
        <el-select v-model="queryParams.status" placeholder="선택해 주세요:상태" clearable style="width: 200px">
          <el-option key="1" label="예" value="1"/>
          <el-option key="0" label="아니요" value="0"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery">검색</el-button>
        <el-button icon="Refresh" @click="resetQuery">초기화</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['system:oss:add']"
        >추가</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:oss:edit']"
        >수정</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:oss:remove']"
        >삭제</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="ossConfigList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="기본 키" align="center" prop="ossConfigId" v-if="columns[0].visible"/>
      <el-table-column label="설정key" align="center" prop="configKey" v-if="columns[1].visible" />
      <el-table-column label="접속 주소" align="center" prop="endpoint" v-if="columns[2].visible" width="200" />
      <el-table-column label="사용자 지정 도메인" align="center" prop="domain" v-if="columns[3].visible" width="200" />
      <el-table-column label="버킷명" align="center" prop="bucketName" v-if="columns[4].visible" />
      <el-table-column label="접두사" align="center" prop="prefix" v-if="columns[5].visible" />
      <el-table-column label="리전" align="center" prop="region" v-if="columns[6].visible" />
      <el-table-column label="버킷 권한 유형" align="center" prop="accessPolicy" v-if="columns[7].visible" >
        <template #default="scope">
          <el-tag type="warning" v-if="scope.row.accessPolicy === '0'">private</el-tag>
          <el-tag type="success" v-if="scope.row.accessPolicy === '1'">public</el-tag>
          <el-tag type="info" v-if="scope.row.accessPolicy === '2'">custom</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="기본 여부" align="center" prop="status" v-if="columns[8].visible">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            active-value="1"
            inactive-value="0"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="작업" align="center" width="150" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:oss:edit']">수정</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:oss:remove']">삭제</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改对象存储配置对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="ossConfigRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="설정key" prop="configKey">
          <el-input v-model="form.configKey" placeholder="입력해 주세요:설정key" />
        </el-form-item>
        <el-form-item label="접속 주소" prop="endpoint">
          <el-input v-model="form.endpoint" placeholder="입력해 주세요:접속 주소" />
        </el-form-item>
        <el-form-item label="사용자 지정 도메인" prop="domain">
          <el-input v-model="form.domain" placeholder="입력해 주세요:사용자 지정 도메인" />
        </el-form-item>
        <el-form-item label="accessKey" prop="accessKey">
          <el-input v-model="form.accessKey" placeholder="입력해 주세요:accessKey" />
        </el-form-item>
        <el-form-item label="secretKey" prop="secretKey">
          <el-input v-model="form.secretKey" placeholder="입력해 주세요:비밀 키" show-password />
        </el-form-item>
        <el-form-item label="버킷명" prop="bucketName">
          <el-input v-model="form.bucketName" placeholder="입력해 주세요:버킷명" />
        </el-form-item>
        <el-form-item label="접두사" prop="prefix">
          <el-input v-model="form.prefix" placeholder="입력해 주세요:접두사" />
        </el-form-item>
        <el-form-item label="HTTPS 사용 여부">
          <el-radio-group v-model="form.isHttps">
            <el-radio
              v-for="dict in sys_yes_no"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="버킷 권한 유형">
          <el-radio-group v-model="form.accessPolicy">
            <el-radio label="0">private</el-radio>
            <el-radio label="1">public</el-radio>
            <el-radio label="2">custom</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="리전" prop="region">
          <el-input v-model="form.region" placeholder="입력해 주세요:리전" />
        </el-form-item>
        <el-form-item label="비고" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="내용을 입력해 주세요." />
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

<script setup name="OssConfig">

import {
  listOssConfig,
  getOssConfig,
  delOssConfig,
  addOssConfig,
  updateOssConfig,
  changeOssConfigStatus
} from "@/api/system/ossConfig";

const { proxy } = getCurrentInstance();
const { sys_yes_no } = proxy.useDict("sys_yes_no");

const ossConfigList = ref([]);
const open = ref(false);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

// 列显隐信息
const columns = ref([
  { key: 0, label: `기본 키`, visible: true },
  { key: 1, label: `설정key`, visible: false },
  { key: 2, label: `접속 주소`, visible: true },
  { key: 3, label: `사용자 지정 도메인`, visible: true },
  { key: 4, label: `버킷명`, visible: true },
  { key: 5, label: `접두사`, visible: true },
  { key: 6, label: `리전`, visible: true },
  { key: 7, label: `버킷 권한 유형`, visible: true },
  { key: 8, label: `상태`, visible: true }
]);

const data = reactive({
  form: {},
  // 查询参数
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    configKey: undefined,
    bucketName: undefined,
    status: undefined,
  },
  rules: {
    configKey: [
      { required: true, message: "configKey항목은 필수입니다.", trigger: "blur" },
    ],
    accessKey: [
      { required: true, message: "accessKey항목은 필수입니다.", trigger: "blur" },
      {
        min: 2,
        max: 200,
        message: "accessKey허용 길이: 2 ~ 100 사이",
        trigger: "blur",
      },
    ],
    secretKey: [
      { required: true, message: "secretKey항목은 필수입니다.", trigger: "blur" },
      {
        min: 2,
        max: 100,
        message: "secretKey허용 길이: 2 ~ 100 사이",
        trigger: "blur",
      },
    ],
    bucketName: [
      { required: true, message: "bucketName항목은 필수입니다.", trigger: "blur" },
      {
        min: 2,
        max: 100,
        message: "bucketName허용 길이: 2 ~ 100 사이",
        trigger: "blur",
      },
    ],
    endpoint: [
      { required: true, message: "endpoint항목은 필수입니다.", trigger: "blur" },
      {
        min: 2,
        max: 100,
        message: "endpoint이름의 허용 길이: 2 ~ 100 사이",
        trigger: "blur",
      },
    ],
    accessPolicy:[
      { required: true, message: "accessPolicy항목은 필수입니다.", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 조회객체 스토리지 설정列表 */
function getList() {
  loading.value = true;
  listOssConfig(queryParams.value).then((response) => {
    ossConfigList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
/** 취소버튼 */
function cancel() {
  open.value = false;
  reset();
}
/** 表单초기화 */
function reset() {
  form.value = {
    ossConfigId: undefined,
    configKey: undefined,
    accessKey: undefined,
    secretKey: undefined,
    bucketName: undefined,
    prefix: undefined,
    endpoint: undefined,
    domain: undefined,
    isHttps: "N",
    accessPolicy: "1",
    region: undefined,
    status: "1",
    remark: undefined,
  };
  proxy.resetForm("ossConfigRef");
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
/** 선택条数  */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.ossConfigId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
/** 추가버튼작업 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "추가객체 스토리지 설정";
}
/** 수정버튼작업 */
function handleUpdate(row) {
  loading.value = true;
  reset();
  const ossConfigId = row.ossConfigId || ids.value;
  getOssConfig(ossConfigId).then((response) => {
    loading.value = false;
    form.value = response.data;
    open.value = true;
    title.value = "수정객체 스토리지 설정";
  });
}
/** 저장버튼 */
function submitForm() {
  proxy.$refs["ossConfigRef"].validate(valid => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.ossConfigId != null) {
        updateOssConfig(form.value).then(response => {
          proxy.$modal.msgSuccess("수정되었습니다.");
          open.value = false;
          getList();
        }).finally(() => {
          buttonLoading.value = false;
        });
      } else {
        addOssConfig(form.value).then(response => {
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
/** 사용자 상태수정  */
function handleStatusChange(row) {
  let text = row.status === "1" ? "사용" : "사용 중지";
  proxy.$modal.confirm('변경하시겠습니까:"' + text + '""' + row.configKey + '"설정하시겠습니까?').then(() => {
    return changeOssConfigStatus(row.ossConfigId, row.status, row.configKey);
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess(text + "성공");
  }).catch(function () {
    row.status = row.status === "0" ? "1" : "0";
  });
}
/** 삭제버튼작업 */
function handleDelete(row) {
  const ossConfigIds = row.ossConfigId || ids.value;
  proxy.$modal.confirm('삭제하시겠습니까:OSS설정코드: "' + ossConfigIds + '" 항목을 처리하시겠습니까?').then(() => {
    loading.value = true;
    return delOssConfig(ossConfigIds);
  }).then(() => {
    loading.value = false;
    getList();
    proxy.$modal.msgSuccess("삭제되었습니다.");
  }).finally(() => {
    loading.value = false;
  });
}

getList();
</script>

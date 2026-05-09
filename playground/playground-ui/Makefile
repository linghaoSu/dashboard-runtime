E2E_URL ?=
PKGNAME ?= $(shell cat package.json \
  | grep name \
  | head -1 \
  | awk '{ print $$2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

REGISTRY_SERVER_ADDRESS ?= "release.daocloud.io"
REGISTRY_REPO ?= "$(REGISTRY_SERVER_ADDRESS)/playground"
REGISTRY_USER_NAME ?=
REGISTRY_PASSWORD ?=
kubeconfig ?=

GITLAB_FE_PR_TOKEN ?=
GITLAB_FE_PR_TOKEN_NAME ?=
BACKEND_GROUP ?=
BACKEND_PROJECT ?=
BACKEND_BRANCH ?=
UI_VALUES ?=
UI_TAG_PATH ?=
UI_VERSION_REGEX ?=

FORCE_CACHE ?= 

# For In China:
TRIVY_DB_REPOSITORY?=release-ci.daocloud.io/ghcr/aquasecurity/trivy-db

IMAGE_VERSION := $(shell ./scripts/get-version.sh)

DEPLOY_NS := playground-system

.PHONY: lint
lint:
	pnpm run lint

.PHONY: unit-test
unit-test:
	pnpm run test:unit:ci

.PHONY: e2e-test
e2e-test:
	pnpm run test:e2e

.PHONY: build-image
build-image:
	export DOCKER_CLI_EXPERIMENTAL=enabled ;\
	! ( docker buildx ls | grep ${PKGNAME}-platform-builder ) && docker buildx create --use --platform=linux/arm64,linux/amd64 --name ${PKGNAME}-platform-builder ;\
	docker buildx build \
			--builder ${PKGNAME}-platform-builder \
			--platform linux/arm64,linux/amd64 \
			--build-arg NGINX_IMAGE_VERSION=${NGINX_IMAGE_VERSION} \
			--build-arg FORCE_CACHE=${FORCE_CACHE} \
			--tag $(REGISTRY_REPO)/${PKGNAME}:$(IMAGE_VERSION)  \
			-f Dockerfile \
			--push \
			.

.PHONY: docker-login
docker-login:
	docker login -u ${REGISTRY_USER_NAME} -p ${REGISTRY_PASSWORD} ${REGISTRY_SERVER_ADDRESS}

.PHONY: release
release: docker-login build-image

.PHONY: cve-scan
cve-scan:
	trivy i --exit-code 1 --severity CRITICAL --db-repository=$(TRIVY_DB_REPOSITORY) $(REGISTRY_REPO)/${PKGNAME}:$(IMAGE_VERSION)

.PHONY: change-version
change-version: 
	npm run change:version

.PHONY: deploy
deploy:
	kubectl --kubeconfig ${kubeconfig} set image deployment/${PKGNAME} ${PKGNAME}=$(REGISTRY_REPO)/${PKGNAME}:$(IMAGE_VERSION) -n ${DEPLOY_NS}

.PHONY: deploy-test
deploy-test:
	sed -i "s|PKGNAME|${PKGNAME}|g ; s|MERGEREQUEST|${CI_MERGE_REQUEST_IID}|g ; s|IMAGE_URL|$(REGISTRY_REPO)/${PKGNAME}:$(IMAGE_VERSION)|g" ${TEST_DEPLOY_YAML}
	kubectl --kubeconfig ${test_kubeconfig} apply -f ${TEST_DEPLOY_YAML} --insecure-skip-tls-verify -n dce5

	port=$$(kubectl --kubeconfig $(test_kubeconfig) get svc ${PKGNAME}-merge-requests-$(CI_MERGE_REQUEST_IID) -n dce5 -o jsonpath={.spec.ports[0].nodePort} --insecure-skip-tls-verify); \
	echo $${port}; \
	sed -i "s|PKGNAME|${PKGNAME}|g ; s|MERGEREQUEST|${CI_MERGE_REQUEST_IID}|g ; s|PORT|$${port}|g ; s|TEST_ENV_IP|${TEST_ENV_IP}|g" ${DEV_DEPLOY_YAML}; \
	kubectl --kubeconfig ${dev_kubeconfig} apply -f ${DEV_DEPLOY_YAML} --insecure-skip-tls-verify

	addr=${DEV_ENV_ADDR}/${PKGNAME}-mr-${CI_MERGE_REQUEST_IID} ;\
	curl -v -X POST -H "PRIVATE-TOKEN: ${GITLAB_TOKEN}" "https://gitlab.daocloud.cn/api/v4/projects/${CI_PROJECT_ID}/merge_requests/${CI_MERGE_REQUEST_IID}/notes?body=PR%20Preview:%20$${addr}"

.PHONY: minor-release
minor-release:
	npx esno ./scripts/minor-release.ts

.PHONY: patch-release
patch-release:
	npx esno ./scripts/patch-release.ts

# 新增渠道

## step by step tutorial

:::tip
**first step:** 每个渠道可以理解一个独立的应用，新增渠道就要新增 gitlab-ci,这里增加了/gitlabci/k8s_3013.yml
:::

在.gitlab-ci.yml 引入 3013 的 job

```yaml{7}
include:
  - local: '/gitlabci/k8s_old.yml'
  - local: '/gitlabci/k8s_alpha.yml'
  - local: '/gitlabci/k8s_3004.yml'
  - local: '/gitlabci/k8s_3011.yml'
  - local: '/gitlabci/k8s_3012.yml'
  - local: '/gitlabci/k8s_3013.yml'
  - local: '/gitlabci/fed_test.yml'
  - local: '/gitlabci/deps.yml'
  - local: '/gitlabci/lint.yml'
  - local: '/gitlabci/unit.yml'
  - local: '/gitlabci/sonar.yml'
```

新增 3013 渠道的 job: gilab-ci.yml(gitlabci/k8s_3013.yml):

- 编译镜像 job
- 部署镜像 job

```yaml
variables:
  ALIYUN_CONTAINER_IMAGE: harbor-aliyun.zhhainiao.com/pcwallpaper/pcwallpaper-fe

# 编译3013镜像
k8s_build_3013_image:
  image: 'k8s-reg.cmcm.com/k8s/deploy_helper:latest'
  script:
    - docker pull $ALIYUN_CONTAINER_IMAGE:latest || true
    - docker build --cache-from $ALIYUN_CONTAINER_IMAGE:latest --build-arg CHANNEL=3013 --tag $ALIYUN_CONTAINER_IMAGE:$CI_COMMIT_TAG --tag $ALIYUN_CONTAINER_IMAGE:latest .
    - docker push $ALIYUN_CONTAINER_IMAGE:$CI_COMMIT_TAG
    - docker push $ALIYUN_CONTAINER_IMAGE:latest
  stage: build
  tags:
    - k8s
  only:
    variables:
      - $CI_COMMIT_TAG =~ /^v.*-3013$/

### 部署 3013 版本
k8s_deploy_service_3013: # 部署到正式集群
  image: 'k8s-reg.cmcm.com/k8s/deploy_helper:latest'
  script:
    - deploy_helper -yaml=k8s/3013/.k8s-service.yml -kind=deploy_service -tag=$CI_COMMIT_TAG -image=$ALIYUN_CONTAINER_IMAGE -cls=alisz
  stage: deploy
  environment:
    name: prod_3013
  tags:
    - k8s
  dependencies:
    - k8s_build_3013_image
  when: manual
  only:
    variables:
      - $CI_COMMIT_TAG =~ /^v.*-3013$/
```

:::tip
**second step:** 修改.k8s-ingress.yml ,新增 path
:::

```yaml{21,22,23,24}
rules: # 转发规则
  - host: wallpaper.zhhainiao.com
    http:
      paths:
        - path: /
          backend:
            serviceName: pcwallpaper-fe-alpha
            servicePort: 8000
        - path: /3004
          backend:
            serviceName: pcwallpaper-3004
            servicePort: 8000
        - path: /3011
          backend:
            serviceName: pcwallpaper-3011
            servicePort: 8000
        - path: /3012
          backend:
            serviceName: pcwallpaper-3012
            servicePort: 8000
        - path: /3013
          backend:
            serviceName: pcwallpaper-3013
            servicePort: 8000
```

:::tip
**third step:** 新增 3013 渠道的 k8s-service (k8s/3013/.k8s-service.yml)
:::

```yaml
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoicGN3YWxscGFwZXItMzAxMyIsIm5hbWVzcGFjZSI6InBjd2FsbHBhcGVyIiwia2luZCI6IlNlcnZpY2UiLCJpc3MiOiJrOHMtYXBpLWxpdGUifQ.OI-8MEUFNRLPhGWBCwLmKUmh3VOmMzvVVQWLQSUuGYg

name: pcwallpaper-3013 # 这是服务名
namespace: pcwallpaper # 这是服务部署到的命名空间，按业务部署，相同业务的部署到同一namespace

ports: # 服务的端口，需要和Docker image暴露的一致
  - name: http
    port: 8000

replicas: 3 # 服务正式部署的副本数

requests: # 部署的最低资源需求
  cpu: 0.03 # 0.03个CPU核
  memory: 128Mi # 128MB内存

limits: # 部署的最大资源限制
  cpu: 1 # 1个CPU核
  memory: 1024Mi # 1024MB内存

option:
  readinessProbe: # ready检查
    failureThreshold: 3
    httpGet:
      path: /_healthz # 这个路径是在nginx.conf里面返回的
      port: 8000
      scheme: HTTP
    initialDelaySeconds: 3
    periodSeconds: 5
    successThreshold: 1
    timeoutSeconds: 2
```

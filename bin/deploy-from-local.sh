#!/bin/bash

###############################################################################
# DailyMeal 로컬 빌드 → 원격 배포 스크립트
# Usage: ./bin/deploy-from-local.sh [frontend|backend|all]
###############################################################################

set -e  # 에러 시 즉시 중단

# 색상 출력
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 설정
REMOTE_HOST="ubuntu@43.202.215.27"
SSH_KEY="$HOME/.ssh/dailymeal_ec2"
REMOTE_DIR="~/DailyMeal"
LOCAL_DIR="$HOME/Workspace/DailyMeal"

# 배포 타겟 (기본: all)
TARGET="${1:-all}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}DailyMeal 로컬 빌드 & 원격 배포${NC}"
echo -e "${GREEN}========================================${NC}"

# SSH 연결 테스트
echo -e "\n${YELLOW}[1/5] SSH 연결 테스트...${NC}"
if ! ssh -i "$SSH_KEY" -o ConnectTimeout=5 "$REMOTE_HOST" "echo 'Connection OK'" > /dev/null 2>&1; then
    echo -e "${RED}Error: SSH 연결 실패${NC}"
    echo "ssh -i $SSH_KEY $REMOTE_HOST 로 수동 확인하세요."
    exit 1
fi
echo -e "${GREEN}✓ SSH 연결 성공${NC}"

# Frontend 빌드 & 배포
deploy_frontend() {
    echo -e "\n${YELLOW}[2/5] Frontend 빌드 중...${NC}"
    cd "$LOCAL_DIR/frontend"
    
    # .env.local 임시 백업 (운영 빌드 시 .env.production 우선)
    if [ -f ".env.local" ]; then
        mv .env.local .env.local.backup
        echo "✓ .env.local 임시 백업"
    fi
    
    # 로컬 빌드 (Standalone)
    npm run build
    
    # .env.local 복원
    if [ -f ".env.local.backup" ]; then
        mv .env.local.backup .env.local
        echo "✓ .env.local 복원"
    fi
    
    if [ ! -d ".next/standalone" ]; then
        echo -e "${RED}Error: Standalone 빌드 실패${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Frontend 빌드 완료${NC}"
    
    echo -e "\n${YELLOW}[3/5] Frontend 배포 중...${NC}"
    
    # Standalone 빌드 결과물 전송 (frontend/ 폴더만 추출)
    rsync -avz --delete -e "ssh -i $SSH_KEY" \
        .next/standalone/frontend/ "$REMOTE_HOST:$REMOTE_DIR/frontend/"
    
    # .next 디렉토리 생성 (standalone 전송 후)
    ssh -i "$SSH_KEY" "$REMOTE_HOST" "mkdir -p $REMOTE_DIR/frontend/.next/static"
    
    # Static 파일 전송 (.next/static)
    rsync -avz --delete -e "ssh -i $SSH_KEY" \
        .next/static/ "$REMOTE_HOST:$REMOTE_DIR/frontend/.next/static/"
    
    # Public 폴더 전송
    rsync -avz -e "ssh -i $SSH_KEY" \
        public/ "$REMOTE_HOST:$REMOTE_DIR/frontend/public/"
    
    echo -e "${GREEN}✓ Frontend 배포 완료 (node_modules 포함)${NC}"
}

# Backend 배포
deploy_backend() {
    echo -e "\n${YELLOW}[2/5] Backend 빌드 중...${NC}"
    cd "$LOCAL_DIR/backend"
    
    # 로컬 빌드 (TypeScript → JavaScript)
    npm run build
    
    if [ ! -d "dist" ]; then
        echo -e "${RED}Error: dist 폴더 생성 실패${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Backend 빌드 완료${NC}"
    
    echo -e "\n${YELLOW}[3/5] Backend 배포 중...${NC}"
    
    # dist 폴더 전송 (컴파일된 JavaScript)
    rsync -avz --delete -e "ssh -i $SSH_KEY" \
        dist/ "$REMOTE_HOST:$REMOTE_DIR/backend/dist/"
    
    # 운영 의존성만 준비
    echo "Preparing production dependencies..."
    npm prune --production
    
    # node_modules 전송 (운영용만, devDependencies 제외)
    rsync -avz --delete -e "ssh -i $SSH_KEY" \
        --exclude='@types' \
        --exclude='typescript' \
        --exclude='ts-node' \
        --exclude='@nestjs/cli' \
        node_modules/ "$REMOTE_HOST:$REMOTE_DIR/backend/node_modules/"
    
    # package.json만 전송 (tsconfig 등 빌드 파일 불필요)
    rsync -avz -e "ssh -i $SSH_KEY" \
        package.json \
        "$REMOTE_HOST:$REMOTE_DIR/backend/"
    
    # 개발 의존성 복원 (로컬 개발 계속 가능)
    echo "Restoring dev dependencies..."
    npm install --silent
    
    echo -e "${GREEN}✓ Backend 배포 완료 (운영 의존성만)${NC}"
}

# 원격 서버 PM2 재시작
restart_remote() {
    echo -e "\n${YELLOW}[4/5] PM2 설정 업데이트 중...${NC}"
    
    # ecosystem.config.js 전송
    rsync -avz -e "ssh -i $SSH_KEY" \
        "$LOCAL_DIR/ecosystem.config.js" "$REMOTE_HOST:$REMOTE_DIR/"
    
    echo -e "\n${YELLOW}[5/5] PM2 재시작 중...${NC}"
    
    ssh -i "$SSH_KEY" "$REMOTE_HOST" << 'ENDSSH'
        cd ~/DailyMeal
        
        # PM2 재시작
        if pm2 list | grep -q "dailymeal"; then
            pm2 delete all
            pm2 start ecosystem.config.js
        else
            pm2 start ecosystem.config.js
        fi
        
        # PM2 설정 저장
        pm2 save
        
        # 상태 확인
        pm2 status
ENDSSH
    
    echo -e "${GREEN}✓ PM2 재시작 완료${NC}"
}

# 배포 실행
case "$TARGET" in
    frontend)
        deploy_frontend
        restart_remote
        ;;
    backend)
        deploy_backend
        restart_remote
        ;;
    all)
        deploy_frontend
        deploy_backend
        restart_remote
        ;;
    *)
        echo -e "${RED}Error: Invalid target '$TARGET'${NC}"
        echo "Usage: $0 [frontend|backend|all]"
        exit 1
        ;;
esac

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}배포 완료!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "사이트: ${YELLOW}https://dailymeal.kr${NC}"
echo -e "로그 확인: ${YELLOW}ssh -i $SSH_KEY $REMOTE_HOST 'pm2 logs'${NC}"

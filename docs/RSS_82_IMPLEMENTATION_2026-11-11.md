# HANBOM DATA: 한봄고등학교 공개 RSS 82종 통합 개발기

**기준 문서:** 사용자가 직접 첨부한 `한봄고등학교 홈페이지 RSS 목록.md` (총 82행, 23개 상위 메뉴). 2026-11-11 구현.

## 실제 적용 범위

기존 RSS **31개**를 보존하고 새 RSS **51개**를 추가한다. 입력값과 메뉴 이름은 원문을 우선하며 **원문의 오기처럼 보이는 단어도 임의로 변경하지 않는다**. 같은 이름이 다른 상위 메뉴에 있어도 별도 `id`, `mi`, `bbsId`로 유지한다.

| 항목 | 개수 |
| --- | ---: |
| 전체 RSS 원본 | **82** |
| 기존 지원 | 31 |
| 이번 신규 | 51 |
| 상위 메뉴 | 23 |
| 전체 HTML pill | 24개 상위 + 하위 82개 + 각 메뉴 전체 23개 |
| 기존 ChatGPT MCP 도구 | 67 |
| 신규 도구 | `list_school_boards` 1 |
| 현행 MCP 도구 | **68** |
| REST 직접 경로 | 82 |
| Cloudflare all 조회 분할 | **3 shards (28 / 28 / 26)** |

### 문서 원본과 카탈로그

- [사용자 원본 목록](source/HANBOM_RSS_SOURCE_2026-11-11.md) — 원문 그대로 보존.
- [카탈로그 JavaScript](../catalog.mjs) — 운영 Worker에서 불러오는 82개 원본 설정.
- [기계 판독형 JSON](../config/rss-catalog-82.json) — 23개 상위 메뉴와 기존·신규 82개 입력값.
- URL은 `https://hanbom-h.goesw.kr`의 고정 공개 RSS 경로만 조회하며, 사용자 요청 문자열로 임의 도메인을 fetch하지 않는다.

## 82개 RSS 전체 입력값

| # | 상위 메뉴 | 게시판 이름 | category ID | 원본 RSS | REST 직접 경로 | 공개 |
|---:|---|---|---|---|---|---|
| 1 | 모집요항 | 진로적성 특별전형 | `admission_special` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17125&bbsId=9974) | `/api/board/admission_special` | 일반 공개 RSS |
| 2 | 학교홍보 | 학생작품 및 수상내역 | `awards` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17172&bbsId=10010) | `/api/awards` | 일반 공개 RSS |
| 3 | 학교홍보 | 한봄 NEWS | `news` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17187&bbsId=10022) | `/api/news` | 일반 공개 RSS |
| 4 | 입학안내 | 학과체험 | `department_experience` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17225&bbsId=10045) | `/api/board/department_experience` | 일반 공개 RSS |
| 5 | 알림 | 공지사항 | `notice` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17249&bbsId=10062) | `/api/notices` | 일반 공개 RSS |
| 6 | 알림 | 가정통신문 | `letter` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17252&bbsId=10063) | `/api/letters` | 일반 공개 RSS |
| 7 | 알림 | 가정통신문(교육청) | `office_letter` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17254&bbsId=10064&bbsTy=HCNOTIE) | `/api/education-letters` | 일반 공개 RSS |
| 8 | 알림 | 공모전 및 모집공고 | `opportunities` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17255&bbsId=10065) | `/api/opportunities` | 일반 공개 RSS |
| 9 | 알림 | 보건알림 | `health` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17256&bbsId=10066) | `/api/health-notices` | 일반 공개 RSS |
| 10 | 학교생활 | 교육과정 | `education_curriculum` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17262&bbsId=10070) | `/api/board/education_curriculum` | 일반 공개 RSS |
| 11 | 학교생활 | 학생생활규정게시판 | `student_rules` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17273&bbsId=10074) | `/api/student-rules` | 일반 공개 RSS |
| 12 | 학교생활 | 봉사활동 | `volunteer` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17276&bbsId=10075) | `/api/volunteer` | 일반 공개 RSS |
| 13 | 동아리활동 | 동아리활동 사진 | `club_photos` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17286&bbsId=10080) | `/api/board/club_photos` | 일반 공개 RSS |
| 14 | 학교생활 | 방과후학교 | `after_school` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17288&bbsId=10081) | `/api/after-school` | 일반 공개 RSS |
| 15 | 학교특색활동 | 학교특색활동 | `feature_main` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17292&bbsId=10082) | `/api/featured-activities` | 일반 공개 RSS |
| 16 | 학교특색활동 | 뷰티아트과 | `feature_beauty` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17298&bbsId=10085) | `/api/featured-activities/beauty` | 일반 공개 RSS |
| 17 | 학교특색활동 | 캐릭터창작과 | `feature_character` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17300&bbsId=10087) | `/api/featured-activities/character` | 일반 공개 RSS |
| 18 | 학교특색활동 | 시각디자인과 | `feature_visual` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17303&bbsId=10089) | `/api/featured-activities/visual` | 일반 공개 RSS |
| 19 | 학교특색활동 | 빅데이터정보과 | `feature_bigdata` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17305&bbsId=10091) | `/api/featured-activities/bigdata` | 일반 공개 RSS |
| 20 | 학교특색활동 | 스마트제어과 | `feature_smart` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17307&bbsId=10092) | `/api/featured-activities/smart` | 일반 공개 RSS |
| 21 | 학교특색활동 | 사운드디자인과 | `feature_sound` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17310&bbsId=10094) | `/api/featured-activities/sound` | 일반 공개 RSS |
| 22 | 학교급식안내 | 급식게시판 | `meals` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17364&bbsId=10112) | `/api/meals` | 일반 공개 RSS |
| 23 | 학교급식안내 | 영양상담 | `nutrition` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17371&bbsId=10115) | `/api/nutrition` | 일반 공개 RSS |
| 24 | 학교급식안내 | 축산물이력표시 | `livestock` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17378&bbsId=10118) | `/api/livestock` | 일반 공개 RSS |
| 25 | 학교생활 | 교육활동침해 에방교육계획 | `teacher_protection` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17381&bbsId=10120) | `/api/education-protection` | 일반 공개 RSS |
| 26 | 취업/진학 | 취업현황 | `employment_status` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17400&bbsId=10131) | `/api/employment-status` | 일반 공개 RSS |
| 27 | 취업/진학 | 취업자료 | `employment_resources` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17404&bbsId=10133) | `/api/employment-resources` | 일반 공개 RSS |
| 28 | 취업/진학 | 진로진학자료 | `career_resources` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17413&bbsId=10136) | `/api/career-resources` | 일반 공개 RSS |
| 29 | 교과자료실 | 보통교과 | `curriculum_general` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17438&bbsId=10155) | `/api/curriculum/general` | 일반 공개 RSS |
| 30 | 교과자료실 | 뷰티아트과 | `curriculum_beauty` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17441&bbsId=10158) | `/api/curriculum/beauty` | 일반 공개 RSS |
| 31 | 교과자료실 | 캐릭터창작과 | `curriculum_character` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17446&bbsId=10160) | `/api/curriculum/character` | 일반 공개 RSS |
| 32 | 교과자료실 | 시각디자인과 | `curriculum_visual` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17450&bbsId=10163) | `/api/curriculum/visual` | 일반 공개 RSS |
| 33 | 교과자료실 | 빅데이터정보과 | `curriculum_bigdata` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17457&bbsId=10169) | `/api/curriculum/bigdata` | 일반 공개 RSS |
| 34 | 교과자료실 | 스마트제어과 | `curriculum_smart` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17465&bbsId=10176) | `/api/curriculum/smart` | 일반 공개 RSS |
| 35 | 교과자료실 | 사운드디자인과 | `curriculum_sound` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17470&bbsId=10179) | `/api/curriculum/sound` | 일반 공개 RSS |
| 36 | 커뮤니티 | 각종양식[서식] | `community_forms` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17489&bbsId=10188) | `/api/board/community_forms` | 일반 공개 RSS |
| 37 | 커뮤니티 | 재학생게시판 | `community_students` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17539&bbsId=10225) | `/api/board/community_students` | **제목·요약 비공개** |
| 38 | 커뮤니티 | 학부모게시판 | `community_parents` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17546&bbsId=10231) | `/api/board/community_parents` | **제목·요약 비공개** |
| 39 | 커뮤니티 | 교사게시판 | `community_teachers` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17550&bbsId=10234) | `/api/board/community_teachers` | **제목·요약 비공개** |
| 40 | 커뮤니티 | 건의게시판 | `community_suggestions` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17559&bbsId=10240) | `/api/board/community_suggestions` | 일반 공개 RSS |
| 41 | 사이버상담실 | 상담자료실 | `counseling_resources` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17569&bbsId=10247) | `/api/board/counseling_resources` | 일반 공개 RSS |
| 42 | 사이버상담실 | 친구문제 | `counseling_friendship` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17573&bbsId=10250) | `/api/board/counseling_friendship` | **제목·요약 비공개** |
| 43 | 사이버상담실 | 성희롱,성폭력 사이버신고센터 | `counseling_sexual_violence_report` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17609&bbsId=10278) | `/api/board/counseling_sexual_violence_report` | **제목·요약 비공개** |
| 44 | 커뮤니티 | 한봄앨범 | `community_album` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17613&bbsId=10281) | `/api/board/community_album` | 일반 공개 RSS |
| 45 | 커뮤니티 | 성적민원센터 | `community_grades_complaints` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17623&bbsId=10288) | `/api/board/community_grades_complaints` | **제목·요약 비공개** |
| 46 | 커뮤니티 | 학교생활 민원센터 | `community_school_life_complaints` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17625&bbsId=10289) | `/api/board/community_school_life_complaints` | **제목·요약 비공개** |
| 47 | 커뮤니티 | 학생선수고충처리센터 | `community_athlete_complaints` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17627&bbsId=10291) | `/api/board/community_athlete_complaints` | **제목·요약 비공개** |
| 48 | 법인 | 정관 | `foundation_articles` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17654&bbsId=10302) | `/api/board/foundation_articles` | 일반 공개 RSS |
| 49 | 법인 | 임원 인적사항(임원과 친족관게에 있는 교직원 현황) | `foundation_officers` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17657&bbsId=10304) | `/api/board/foundation_officers` | 일반 공개 RSS |
| 50 | 법인 | 예.결산 | `foundation_budget` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17660&bbsId=10306) | `/api/board/foundation_budget` | 일반 공개 RSS |
| 51 | 법인 | 이사회회의록 | `foundation_board_minutes` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17662&bbsId=10307) | `/api/board/foundation_board_minutes` | 일반 공개 RSS |
| 52 | 법인 | 법정부담금 납부 현황 | `foundation_legal_contributions` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17667&bbsId=10310) | `/api/board/foundation_legal_contributions` | 일반 공개 RSS |
| 53 | 법인 | 사무직원인사관리지침 | `foundation_personnel_rules` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17670&bbsId=10311) | `/api/board/foundation_personnel_rules` | 일반 공개 RSS |
| 54 | 예.결산현황 | 예산서 | `budget_proposal` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17687&bbsId=10320) | `/api/board/budget_proposal` | 일반 공개 RSS |
| 55 | 예.결산현황 | 결산서 | `budget_settlement` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17690&bbsId=10322) | `/api/board/budget_settlement` | 일반 공개 RSS |
| 56 | 업무추진비 집행내역 | 업무추진비 집행내역 | `operating_expenses` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17698&bbsId=10326) | `/api/board/operating_expenses` | 일반 공개 RSS |
| 57 | 업무추진비 집행내역 | 신용카드 사용내역 | `credit_card_expenses` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17701&bbsId=10328) | `/api/board/credit_card_expenses` | 일반 공개 RSS |
| 58 | 물품 및 공사계약 | 수의 계약내역 | `procurement_direct_contracts` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17711&bbsId=10336) | `/api/board/procurement_direct_contracts` | 일반 공개 RSS |
| 59 | 물품 및 공사계약 | 입찰공고 | `procurement_bids` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17715&bbsId=10339) | `/api/board/procurement_bids` | 일반 공개 RSS |
| 60 | 물품 및 공사계약 | 입찰결과 | `procurement_results` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17718&bbsId=10342) | `/api/board/procurement_results` | 일반 공개 RSS |
| 61 | 물품 및 공사계약 | 물품선정위원회 | `procurement_selection_committee` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17722&bbsId=10346) | `/api/board/procurement_selection_committee` | 일반 공개 RSS |
| 62 | 공개코너 | 상품권 구매 및 사용 내역 | `gift_certificate_expenses` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17732&bbsId=10354) | `/api/board/gift_certificate_expenses` | 일반 공개 RSS |
| 63 | 수익자부담 경비집행내역 | 방과후학교 | `fee_after_school` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17739&bbsId=10357) | `/api/board/fee_after_school` | 일반 공개 RSS |
| 64 | 수익자부담 경비집행내역 | 수학여행 | `fee_school_trip` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17741&bbsId=10358) | `/api/board/fee_school_trip` | 일반 공개 RSS |
| 65 | 수익자부담 경비집행내역 | 체험학습 | `fee_field_trip` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17745&bbsId=10362) | `/api/board/fee_field_trip` | 일반 공개 RSS |
| 66 | 수익자부담 경비집행내역 | 수련회선정 | `fee_camp_selection` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17747&bbsId=10364) | `/api/board/fee_camp_selection` | 일반 공개 RSS |
| 67 | 학교발전기금 | 운용계획 | `development_fund_plan` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17758&bbsId=10369) | `/api/board/development_fund_plan` | 일반 공개 RSS |
| 68 | 학교발전기금 | 접수 및 집행내역 | `development_fund_income_expense` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17763&bbsId=10373) | `/api/board/development_fund_income_expense` | 일반 공개 RSS |
| 69 | 학교발전기금 | 결산보고서 | `development_fund_settlement` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17766&bbsId=10376) | `/api/board/development_fund_settlement` | 일반 공개 RSS |
| 70 | 학교운영위원회 | 학교운영위원회게시판 | `school_steering_committee` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17780&bbsId=10384) | `/api/board/school_steering_committee` | 일반 공개 RSS |
| 71 | 학교운영위원회 | 학부모 의견수렴 | `parent_opinions` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17785&bbsId=10387) | `/api/board/parent_opinions` | **제목·요약 비공개** |
| 72 | 공개코너 | 교원인사위원회 | `teacher_personnel_committee` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17790&bbsId=10390) | `/api/board/teacher_personnel_committee` | 일반 공개 RSS |
| 73 | 공개코너 | 감사결과 | `audit_results` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17797&bbsId=10392) | `/api/board/audit_results` | 일반 공개 RSS |
| 74 | 공개코너 | 학교운동부집행내역 | `athletic_team_expenses` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17806&bbsId=10397) | `/api/board/athletic_team_expenses` | 일반 공개 RSS |
| 75 | 공개코너 | 기타 | `disclosure_other` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17811&bbsId=10402) | `/api/board/disclosure_other` | 일반 공개 RSS |
| 76 | 공개코너 | 석면해체제거공사 | `asbestos_removal` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17813&bbsId=10404) | `/api/board/asbestos_removal` | 일반 공개 RSS |
| 77 | 공개코너 | 학교평가 | `school_evaluation` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17814&bbsId=10405) | `/api/board/school_evaluation` | 일반 공개 RSS |
| 78 | 공개코너 | 공기정화장치 점검 | `air_purifier_inspection` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17817&bbsId=10408) | `/api/board/air_purifier_inspection` | 일반 공개 RSS |
| 79 | 증명서 발급 | 증명서 Q&A | `certificates_faq` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17826&bbsId=10414) | `/api/board/certificates_faq` | 일반 공개 RSS |
| 80 | 학교시설개방 | 학교시설개방 Q&A | `facilities_faq` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17829&bbsId=10416) | `/api/board/facilities_faq` | 일반 공개 RSS |
| 81 | 학교시설개방 | 사용신청 | `facilities_application` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17840&bbsId=10422) | `/api/board/facilities_application` | 일반 공개 RSS |
| 82 | 행정서비스 | 행정정보공개 | `administrative_disclosure` | [원본](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17866&bbsId=10430) | `/api/board/administrative_disclosure` | 일반 공개 RSS |

## UI 설계

홈페이지 H1 `한봄고 홈페이지 공지사항 MCP`와 **배달의민족 주아체**, 순백색 배경, 중앙 정렬 텍스트 링크 목록, 검정/흰색 pill 버튼, 호버 효과 제거는 유지.

- 상단: **전체 보기**와 문서의 **23개 상위 메뉴**를 원래 순서대로 표시한다.
- 상위 메뉴를 선택하면 해당 상위 메뉴에 속한 게시판만 하위 pill로 표시한다. 하위에선 `전체 보기` 및 원문 게시판명을 그대로 사용.
- `학교특색활동 > 빅데이터정보과`와 `교과자료실 > 빅데이터정보과`는 서로 다른 공식 RSS.
- 데이터는 페이지 로딩 시 `GET /api/posts?limit=all&shard=0,1,2` 3개를 병렬 조회하고, 브라우저에서 게시시각 역순으로 합친 뒤 **전환 시 추가 네트워크 호출 없이** 필터링한다.
- 원문 게시물 제목은 `textContent`만 사용하여 HTML 삽입을 막으며, 링크는 학교 공식 HTTPS 호스트만 허용.
- 유효한 빈 RSS는 `0건` 정상 표시, `표시할 게시물이 없습니다.` 출력. RSS 일부 실패 시 다른 피드 게시물은 계속 제공.
- <각 메뉴별 사용성: 실제 브라우저 인터랙션 검증 결과는 배포 후 기록>.

## Free Workers subrequest 제한: 3개 shard 필수

Cloudflare Workers 무료 요금제는 **외부 subrequest 호출당 50회** 제한이며 [공식 한도 문서](https://developers.cloudflare.com/workers/platform/limits/)에서 확인 가능하다.

82개 RSS를 한 번의 Worker invocation에서 모두 origin-fetch하는 것은 이 한도에 맞지 않는다. 따라서 기존 31개 통합 조회를 그대로 82개로 늘리지 않는다.

- `SHARD_SIZE=28`: shard 0 (처음 28개), shard 1 (다음 28개), shard 2 (마지막 26개).
- 샤드 캐시가 없는 경우 **최대 28개 원본 fetch + 1 Cache API match + 1 put = 30회**로 제한해 무료 플랜 한도를 지킨다.
- 원본 서버 연결 수 부담을 줄이기 위해 shard별 원본 `fetch()`는 **최대 7개씩 단계별 요청**한다.
- 샤드의 edge 캐시는 180초 TTL. 각 게시판 직접 조회 역시 기존처럼 자체 RSS 캐시 180초.
- **MCP 통합 조회**는 `shard=0`, `shard=1`, `shard=2`로 각각 호출하면 82개 전체를 빠짐없이 확인 가능.
- 서버 단일 응답에 82개 결과가 모두 들어 있다고 주장하지 않도록, `shard`, `shard_count`, `total_source_count`, `has_more`, `next_shard`, `complete` 반환.
- 이전 31개 게시판을 한번에 읽던 작업 흐름은 `category=legacy`로 유지. **31 origin fetch + 2 캐시 호출 = 33회**.

## REST 사용 예

```text
https://data.hanbom.rhee.life/api/catalog
https://data.hanbom.rhee.life/api/posts?shard=0&limit=all
https://data.hanbom.rhee.life/api/posts?shard=1&limit=all
https://data.hanbom.rhee.life/api/posts?shard=2&limit=all
https://data.hanbom.rhee.life/api/feed?category=legacy&limit=all
https://data.hanbom.rhee.life/api/feed?category=community&limit=all
https://data.hanbom.rhee.life/api/feed?category=foundation&limit=all
https://data.hanbom.rhee.life/api/board/community_forms
https://data.hanbom.rhee.life/api/feed?category=admission_special
https://data.hanbom.rhee.life/api/search?category=foundation&q=정관
https://data.hanbom.rhee.life/api/status?category=all&shard=2
```

- `/api/meta` 및 `/api/catalog`는 전체 `catalog`, `menus`, `source_count=82`, `shard_count=3` 제공.
- 모든 82개 게시판의 직접 경로는 표에 있다. 기존 31개 직접 경로는 변경하지 않음.
- 상위 메뉴별 category는 `MENU_CATALOG.id`, 개별 게시판별 category는 표의 `category ID`.
- `/api/posts`는 예전대로 기본 20개 항목을 반환하되 현재 요청한 shard 범위의 20개다.
- `/api/feed?category=legacy`를 통해 이전 31개 게시판의 합산 조회 하위호환 제공.

## MCP 도구 및 클라이언트 등록

기존 **67개 MCP 도구 이름을 전부 유지**했다. 82개를 새로 전용 도구로 쌓아 ChatGPT 등록/도구 탐색을 복잡하게 만들지 않고, 이미 존재하는 아래 도구를 82종으로 확장했다.

- `get_board_posts({category,limit?,shard?})`: 82개 단일 게시판 또는 23개 상위 메뉴 또는 `all`/`legacy`.
- `search_board_posts({category,query,limit?,shard?})`: 동일 범위 검색.
- `get_school_feed_status({category?,shard?})`: 상태, 게시물 건수, partial/failed_feeds, 다음 샤드 정보.
- `get_all_school_posts({limit?,shard?})`와 `search_all_school_posts({query,limit?,shard?})`: `all` 전체 대상 shard 페이징.
- **신규 도구** `list_school_boards({})`: 82개 게시판 ID, 23개 메뉴 계층, source URL, 직접 API 경로를 제공한다.

ChatGPT 앱 등록값 **Name: HANBOM Data MCP**, **URL: `https://data.hanbom.rhee.life/mcp`**, **Transport: Streamable HTTP**, **Authentication: None** 그대로. 기존 설치된 앱의 도구 목록 갱신이 필요할 수 있다.

## 개인정보 보호 및 공개 범위

- 이 프로젝트는 공식 학교 시스템이 아니라 **공식 홈페이지에 이미 공개된 RSS만 읽는 비공식 서비스**.
- 상담·신고·민원·학생/학부모/교사 게시판 등 **9개 민감 가능 게시판**은 웹·REST·MCP에서 원본 제목·요약을 복제하지 않고 게시물 제목을 `상담·민원 게시물 (원문 확인)`으로 대체한다. 게시물의 출처 URL·시각·카테고리만 제공한다.
- 상담·신고 게시물에 포함된 피해자·학생 이름이나 사건 내용이 공개 UI에 확대 재노출되지 않도록 최소 데이터 원칙을 따른다.
- 각 원본 게시판의 회원 전용·쓰기 기능 또는 학교 관리자 권한에는 접근하지 않는다.
- Cloudflare Access 과거 앱/정책은 보관 상태 유지. 운영 도메인은 계속 공개 읽기 전용.

## 개발·검증

- GitHub repo `hslcrb/mcp-for-hanbom`, Cloudflare Worker `mcp-for-hanbom`.
- 신규 `catalog.mjs`, `config/rss-catalog-82.json`, `worker.mjs`, `test/rss82.test.mjs`와 기존 회귀 테스트 수정.
- GitHub Actions를 생성하거나 사용하지 않는다. `main` 커밋만 Cloudflare Workers Builds가 자동 빌드/배포한다.
- 기존 브랜치/Workers 도메인을 변경하지 않는다.
- 프로덕션 최종 커밋·빌드 로그·82개 실제 RSS 수신 상태는 검증 후 아래 후속 섹션에 기록한다.

---

## 실제 프로덕션 배포 및 82개 RSS 검증 — 2026-11-11 KST

### GitHub 및 Cloudflare Workers Builds

- 82종 소스 전체 등록·초기 코드와 문서의 `main` 통합 커밋: `134a5314571e897ccab7891b8f7989a1c39672e8`.
- 초기 Workers Builds ID `9fa2f171-9dfa-4c42-8e14-d649a3995e7a`에서 51개 테스트 중 2개 실패(기존 테스트의 `공지 사항` 표기 불일치 및 개인정보 보호 처리된 민원 제목을 원문 검색하려던 테스트 기대값). 빌드는 차단되고 이전 프로덕션은 유지됨.
- 회귀 테스트 수정 커밋: `33f8b437d811adc373b8b1e6edbf9d76cd3b5a40`.
- 수정 빌드 ID `62b5ba6a-6a90-4f78-b379-de98ed10d1b4`, **51/51 테스트 통과, 실패 0, 빌드·배포 `success`**.
- 해당 Worker 프로덕션 버전 `d5d5bc17-54a2-4c60-8b31-55b47a4c589b` 100% 적용 확인. 도메인은 `data.hanbom.rhee.life`.
- GitHub Actions는 생성하지 않았고 기존 **GitHub main → Cloudflare Workers Builds** 연결을 사용함.

### 실서비스 세 개 shard의 실제 RSS 수집

Cloudflare Browser Rendering에서 실제 운영 HTTP GET `/api/status?category=all&shard=N` 세 요청을 독립 실행:

| 분할 | 공식 원본 RSS 수 | 실제 RSS item 수 | partial | failed_feeds | 다음 shard |
|---|---:|---:|---|---|---|
| 0 | 28 | 366 | false | [] | 1 |
| 1 | 28 | 59 | false | [] | 2 |
| 2 | 26 | 103 | false | [] | null |
| 합계 | **82** | **528** | 전부 정상 | **0개 실패** | 완료 |

**528건은 RSS가 현재 제공하는 범위의 수집 건수**로, 게시판의 전체 누적 기록 수와 다름. 각 RSS는 최대 100개 item까지만 파싱한다. 0개를 반환하는 게시판도 정상 RSS로 응답했으며, 실패로 처리하지 않았다.

예시: `community_forms` 11건, `community_album` 19건, `foundation_board_minutes` 8건, `school_steering_committee` 31건, `teacher_personnel_committee` 35건, `air_purifier_inspection` 11건. 이 수치들은 해당 수집 시점의 snapshot임.

### 실제 브라우저 렌더링·메뉴 전환 검증

Cloudflare Browser Rendering으로 공개 `https://data.hanbom.rhee.life/`를 열어 `waitForSelector('#notices li a')`로 비동기 로딩 완료를 기다림.

- H1, 23개 상위 메뉴, 82개 하위 게시판 선택지의 렌더링 확인.
- 전체 보기에서 **실제 원문 링크 528개**가 렌더링됐으며, `상담·민원 게시물 (원문 확인)` 보호 문구 노출도 확인.
- 임시 브라우저 테스트 스크립트로 실제 메뉴 버튼 `click()` 수행. 이 테스트 스크립트는 운영 소스에 남기지 않음.
- `커뮤니티` 메뉴 클릭: 하위 메뉴 표시, 관련 게시물 32건.
- `각종양식[서식]` 하위 선택: 11건만 표시.
- `법인` 메뉴 클릭: 법인 하위 메뉴 표시, 이전 커뮤니티 하위 메뉴 숨김.
- `이사회회의록` 하위 선택: 8건 표시.
- `학교특색활동 > 빅데이터정보과` 하위 선택: RSS가 비어 있어 정상 `표시할 게시물이 없습니다.` 메시지 표시.
- 다시 최상위 `전체 보기`로 복귀: 528건의 실제 링크가 복원됨.

### 실제 원격 MCP HTTP JSON-RPC 검증

공개 도메인에 브라우저에서 실제 `POST /mcp` JSON-RPC 요청을 보내 확인:

- `tools/list`: **MCP 도구 68개**, `list_school_boards` 존재.
- `tools/call: list_school_boards`: **게시판 82개**와 상위 메뉴 **23개** 반환.
- `tools/call: get_board_posts({category:"foundation_board_minutes",limit:2})`: 해당 게시판 카테고리로 정상 응답, RSS 전체 건수 8.
- 기존 67개 도구를 유지하는 것과 shard 조회·검색, 82개 직접 REST 경로의 동작은 **51개 Node 테스트**로 검증했다.
- 현재 ChatGPT에 설치된 앱이 새 도구를 즉시 표시하는지는 클라이언트 측 MCP 도구 재동기화 상태에 따라 달라질 수 있으며 앱 단위 재발견까지 보장한 것은 아님.

### 보안·운영

- 민감 가능 9개 게시판의 원문 제목·요약 공개 재전송을 피하는 보호 규칙 유지.
- 모든 source URL은 첨부 원문 82개에 고정. RSS 원문의 공식 학교 HTTPS 링크만 원문으로 노출.
- Cloudflare Access 비활성 보관 설정을 이번 작업에서 바꾸지 않았으며 운영 홈페이지·REST·MCP는 공개 읽기 전용 상태 유지.
- 무료 Worker에 맞게 각 통합 조회를 28/28/26건의 origin 요청으로 나눈다. 단일 `/api/posts` 요청이 82개를 전부 반환한다고 오인하지 않도록 `has_more` 및 `next_shard` 메타데이터를 사용한다.

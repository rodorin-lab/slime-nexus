# SLIME://NEXUS — 設計書

**プロジェクト名:** SLIME://NEXUS
**ジャンル:** 2.5D サイバーパンク スライム育成ゲーム
**エンジン:** Godot 4
**ターゲットプラットフォーム:** PC (Windows / Linux / macOS)
**作成日:** 2026-03-19

---

## 1. ビジョン

雨の降るサイバーパンクな路地裏を舞台に、スライムを育て、進化させ、戦わせる育成RPG。

- **ビジュアル:** Octopath Traveler 風の 2.5D。Godot 4 の 3D 空間に手描きドット絵スプライトを配置し、ネオンライティングと体積霧でサイバーパンクの雰囲気を演出する
- **インスパイア:** デジモン（育て方で分岐する進化）× モンスターファーム（合成による新種生成）
- **こだわり:** プニプニしたスライムの質感（カスタムシェーダー）、レトロフューチャーなCRTスタイルUI、雨音とネオンの光

---

## 2. コアゲームプレイループ

```
育成 ──→ 進化 / 合成 ──→ バトル ──→ 探索
 ↑                                      │
 └──────────────────────────────────────┘
```

| システム | 概要 |
|---------|------|
| **育成** | エサ・トレーニング・休息でパラメータを変化させる。ストレス・好感度が進化先に影響 |
| **進化** | 育て方によって進化先が分岐（デジモン型）。同じスライムでも全く異なる姿に |
| **合成** | 2体のスライムを合成して新種を生み出す（モンスターファーム型）。親の特性を引き継ぐ |
| **バトル** | ターン制。スキル・属性・状態異常。サイバーパンクアリーナで演出 |
| **探索** | 3D路地裏マップを歩き、素材収集・NPC会話・ランダムエンカウント |
| **図鑑** | 発見したスライム種族を記録するコレクション要素 |

---

## 3. アーキテクチャ

**方針:** ハイブリッド型 (Resource + Autoload)

- **Godot Resource (.tres)** でスライム定義・進化ルートなどのゲームデータを管理。エディタのInspectorで直接編集可能
- **Autoload** は最小限（GameState / SaveSystem / AudioManager / EventBus の4本のみ）。肥大化を防ぐ
- **`systems/`** に純粋ロジック（Node不要のGDScriptクラス）を分離。テスト・デバッグが容易
- シーン間の通信は **EventBus（シグナルバス）** パターンで疎結合を保つ

### 2.5Dレンダリング方針

Godot 3D + Sprite3D の組み合わせ（Octopath Traveler と同手法）:

- `WorldEnvironment` でネオンアンビエントライト・体積霧・DOF設定
- スライムは `Sprite3D` でカメラに正対させる（Billboardモード）
- 環境は低ポリ3Dモデル + ドット絵テクスチャで奥行きを演出

---

## 4. ディレクトリ構造

```
slime_nexus/
│
├── project.godot
├── .gitignore
│
├── autoloads/                    # グローバルシングルトン（最小限）
│   ├── game_state.gd             # 現在のシーン・プレイヤー状態
│   ├── save_system.gd            # セーブ/ロード (JSON)
│   ├── audio_manager.gd          # BGM・SE管理
│   └── event_bus.gd              # グローバルシグナルバス
│
├── resources/                    # Godot Resource (.tres) — ゲームデータの核
│   ├── slimes/
│   │   ├── slime_definition.gd   # Resource基底クラス（種族定義）
│   │   ├── slime_instance.gd     # 実際に育てているスライムの状態
│   │   └── data/                 # *.tres ファイル（proto_slime.tres 等）
│   ├── evolution/
│   │   ├── evolution_path.gd     # 進化条件・分岐ルート Resource
│   │   └── evolution_tree.tres   # 全進化ツリーデータ
│   ├── items/
│   │   ├── item_definition.gd
│   │   └── data/                 # エサ・サイバーパーツ・素材
│   └── skills/
│       ├── skill_definition.gd
│       └── data/                 # バトルスキルデータ
│
├── scenes/                       # シーン — 描画と演出
│   ├── main/
│   │   ├── main.tscn             # エントリーポイント
│   │   └── title_screen.tscn
│   ├── world/                    # 3D探索マップ
│   │   ├── world_map.tscn
│   │   ├── alley_stage.tscn      # 雨の路地裏ステージ
│   │   ├── neon_district.tscn    # ネオン街区
│   │   └── components/           # 再利用可能なステージ部品
│   ├── raising/                  # スライム育成画面
│   │   ├── raising_room.tscn     # メイン育成UI
│   │   ├── slime_viewer.tscn     # スライム3Dビューア
│   │   └── fusion_lab.tscn       # 合成ラボ
│   ├── battle/                   # バトルシステム
│   │   ├── battle_arena.tscn
│   │   ├── battle_manager.gd     # バトルロジック制御
│   │   └── components/           # HPバー・スキルボタン等
│   └── ui/                       # レトロフューチャーUI部品
│       ├── hud.tscn
│       ├── slime_codex.tscn      # 図鑑
│       ├── cyber_menu.tscn       # メニュー
│       └── theme/                # UIテーマ (.theme)
│
├── systems/                      # 純粋ロジック（Node不要のGDScript）
│   ├── evolution_system.gd       # 進化条件チェック・処理
│   ├── fusion_system.gd          # 合成アルゴリズム
│   ├── battle_calculator.gd      # ダメージ計算・ターン処理
│   └── raising_calculator.gd     # 育成パラメータ更新
│
├── assets/                       # 生アセット
│   ├── sprites/
│   │   ├── slimes/               # スライムドット絵スプライトシート
│   │   ├── environment/          # 背景・小物
│   │   └── ui/                   # UIアイコン・フレーム
│   ├── shaders/
│   │   ├── slime_wobble.gdshader # プニプニ変形シェーダー ★
│   │   ├── neon_glow.gdshader    # ネオングロウ ★
│   │   ├── rain_effect.gdshader  # 雨エフェクト ★
│   │   └── scanline_ui.gdshader  # レトロCRTスキャンライン ★
│   ├── audio/
│   │   ├── bgm/                  # サイバーパンクBGM
│   │   └── sfx/                  # SE（プニプニ音・ネオン音）
│   ├── fonts/                    # ピクセルフォント / サイバーフォント
│   └── 3d_models/                # 環境用3Dモデル（低ポリ）
│
└── docs/
    └── superpowers/specs/        # 設計書
```

---

## 5. コアデータモデル

### SlimeDefinition (Resource)

```gdscript
class_name SlimeDefinition
extends Resource

@export var id: String                    # "proto_slime"
@export var display_name: String          # "プロトスライム"
@export var sprite_sheet: Texture2D
@export var base_stats: SlimeStats        # HP・ATK・DEF・SPD基礎値
@export var element: SlimeElement         # CYBER / ACID / VOLT / VOID
@export var element: SlimeElement         # この種族が持つ属性（進化条件チェックに使用）
@export var evolution_paths: Array[EvolutionPath]
@export var fusion_traits: Array[String]  # 合成で引き継がれる特性
```

### SlimeInstance (Resource)

```gdscript
class_name SlimeInstance
extends Resource

@export var definition: SlimeDefinition
@export var nickname: String
@export var level: int
@export var current_stats: SlimeStats
@export var stress: float     # 0.0〜1.0  進化条件に影響
@export var affection: float  # 0.0〜1.0  進化条件に影響
@export var battle_count: int
@export var age_days: int     # プレイヤーが「1日を終える」アクションを実行するたびに加算（リアルタイムではなくアクション駆動）
@export var skills: Array[SkillDefinition]
```

### EvolutionPath (Resource)

```gdscript
class_name EvolutionPath
extends Resource

@export var target_definition: SlimeDefinition
@export var min_level: int
@export var required_element: SlimeElement  # SlimeInstance.definition.element が一致していること（育てているスライム自身の属性）
@export var stress_threshold: float   # ストレスがこれ以下
@export var affection_threshold: float
@export var min_battle_count: int
```

---

## 6. 主要シグナル (EventBus)

```gdscript
# autoloads/event_bus.gd
signal slime_evolved(old_def: SlimeDefinition, new_def: SlimeDefinition)
signal slime_fused(parent_a: SlimeInstance, parent_b: SlimeInstance, child: SlimeInstance)
signal battle_started(player: SlimeInstance, enemy: SlimeInstance)
signal battle_ended(result: BattleResult)
signal scene_change_requested(scene_path: String)
signal slime_stat_changed(slime: SlimeInstance, stat: String, old_val: float, new_val: float)
```

---

## 7. 開発ロードマップ

### Phase 1 — FOUNDATION（基盤構築）

**成果物:** 雨の降る路地裏にスライムが立っているプロトタイプシーン

- [ ] Godot 4 プロジェクト初期化・ディレクトリ構造作成
- [ ] Godot 3D + Sprite3D の 2.5D レンダリングパイプライン構築
- [ ] WorldEnvironment 設定（ネオンライト・霧・アンビエント）
- [ ] 雨エフェクト実装（GPUパーティクル + `rain_effect.gdshader`）
- [ ] サイバーパンク UI テーマ（`.theme` + `scanline_ui.gdshader`）
- [ ] SlimeDefinition / SlimeInstance Resource 基底クラス定義
- [ ] EventBus / GameState / SaveSystem / AudioManager Autoload 実装

### Phase 2 — SLIME CORE（スライムの核）

**成果物:** スライムを育てられる最小限のゲームループ完成

- [ ] スライムドット絵スプライト + AnimationPlayer（アイドル・食事・喜び・ダメージ）
- [ ] `slime_wobble.gdshader` — プニプニ変形シェーダー
- [ ] 育成パラメータシステム（HP・攻撃・防御・ストレス・好感度）
- [ ] エサ・トレーニング・休息アクション実装
- [ ] RaisingRoom シーン + レトロフューチャー UI
- [ ] セーブ/ロード動作確認
- [ ] 5〜10 種プロトタイプスライム種族データ作成

### Phase 3 — EVOLUTION & FUSION（進化と合成）

**成果物:** 育て方で進化が変わり、合成で新種が生まれるシステム完成

- [ ] EvolutionPath Resource 設計（条件分岐・進化先定義）
- [ ] `evolution_system.gd` — 進化条件チェック・エフェクト演出
- [ ] `fusion_system.gd` — 合成アルゴリズム（親パラメータ継承）
- [ ] FusionLab シーン実装
- [ ] 進化エフェクト（`neon_glow.gdshader` + パーティクル）
- [ ] SlimeCodex（図鑑）UI — 発見済み/未発見表示
- [ ] 20〜30 種進化ツリーデータ拡充

### Phase 4 — BATTLE & WORLD（バトルと世界）

**成果物:** 探索・戦闘・育成が一体化した縦スライスデモ

- [ ] `battle_calculator.gd` — ターン制バトルロジック（スキル・属性・状態異常）
- [ ] BattleArena シーン — サイバーパンクアリーナ演出
- [ ] スキルエフェクト（ネオン・電撃・スライムビーム）
- [ ] WorldMap シーン — 3D 路地裏探索（エンカウント・NPC・ショップ）
- [ ] AlleyStage / NeonDistrict ステージ実装
- [ ] AudioManager — サイバーパンク BGM・SE 統合
- [ ] ランダムエンカウントシステム

### Phase 5 — POLISH & RELEASE（磨き上げとリリース）

**成果物:** itch.io リリース v1.0

- [ ] 全シェーダー最終調整
- [ ] ゲームバランス調整・難易度テスト
- [ ] メインストーリー実装（路地裏の謎・最終ボス）— NPCとの会話チェーン10〜15本、最終ボス戦1戦、エンディング演出
- [ ] 50 種以上のスライム種族コンテンツ拡充
- [ ] PC (Windows / Linux / macOS) ビルド・最適化
- [ ] itch.io ストアページ準備・配布

---

## 8. 技術スタック

| 項目 | 選択 | 理由 |
|------|------|------|
| エンジン | Godot 4 | オープンソース・GDScript・3D+2D両対応 |
| 言語 | GDScript (+ シェーダー言語) | Godot ネイティブ・高速プロトタイピング |
| レンダリング | Godot 3D + Sprite3D | Octopath Traveler 同手法・ライティング本格対応 |
| データ管理 | Godot Resource (.tres) | Inspector編集・型安全・エンジンネイティブ |
| シェーダー | GLSL ベース GDShader | プニプニ・ネオン・雨・CRT の 4 本柱 |
| セーブ | JSON (ConfigFile) | 可読性・デバッグのしやすさ |
| バージョン管理 | Git | 標準 |
| 配布 | itch.io | インディーゲーム標準プラットフォーム |

---

## 9. こだわりポイント詳細

### プニプニスライム質感 (`slime_wobble.gdshader`)
スライムのスプライトに適用するフラグメント + 頂点シェーダー。sin波ベースのUV歪みで有機的な揺れを表現。アクション（食事・被ダメージ・進化）に応じて揺れの強度をGDScriptから制御する。

### ネオンライティング (`neon_glow.gdshader` + WorldEnvironment)
Godot 4 の `WorldEnvironment` に `SSILSky` + `Glow` エフェクトを設定。ポイントライト（OmniLight3D）を各ネオン看板に配置。スライムの属性カラー（CYBER=シアン / ACID=グリーン / VOLT=イエロー / VOID=パープル）に対応したオーラエフェクトも実装。

### 雨の路地裏 (`rain_effect.gdshader`)
GPUパーティクルによる雨粒 + シェーダーベースの雨滴リップル（水面反射）。WorldEnvironment の霧と組み合わせてネオンの光が滲む路地裏の雰囲気を作る。

### レトロフューチャーUI (`scanline_ui.gdshader`)
`CanvasLayer` 全体にポストプロセスとして適用するCRTスキャンラインフィルター。Godot の `.theme` リソースでサイバーパンク配色（シアン / マゼンタ / ダークネイビー）を統一。ピクセルフォントと組み合わせてレトロフューチャーの世界観を構築。

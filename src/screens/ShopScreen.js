import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../utils/theme';
import BackHeader from '../components/BackHeader';
import PixelButton from '../components/PixelButton';
import PixelText from '../components/PixelText';
import PixelCard from '../components/PixelCard';
import gameState from '../utils/gameState';
import soundManager from '../utils/soundManager';
import { TOOL_UPGRADES, CLINIC_UPGRADES, SKILL_UPGRADES, CLINIC_EXPANSION, DECORATION_UPGRADES } from '../data/upgrades';
import { STAFF_UPGRADES } from '../data/staff';
import { t } from '../utils/i18n';

const TAB_ACCENTS = {
  tools: COLORS.orange,
  clinic: COLORS.accent,
  skills: COLORS.secondary,
  staff: COLORS.green,
  expand: COLORS.gold,
  decor: COLORS.pink,
  };

  export default function ShopScreen({ navigation }) {
  const [state, setState] = useState(gameState.state);
  const [tab, setTab] = useState('tools');

  useEffect(() => {
    soundManager.playShopMusic();
    const unsub = gameState.subscribe(setState);
    return () => {
      soundManager.stopMusic();
      unsub();
    };
  }, []);

  const handlePurchase = (id, cost) => {
    if (gameState.purchaseUpgrade(id, cost)) {
      soundManager.playMoney();
      gameState.save();
    } else {
      soundManager.playError();
    }
  };

  const handleStaffPurchase = (staffId, cost) => {
    if (gameState.purchaseStaff(staffId, cost)) {
      soundManager.playSuccess();
      gameState.save();
    } else {
      soundManager.playError();
    }
  };

  const handleClinicExpansion = (level, cost) => {
    if (gameState.canAfford(cost) && state.clinicLevel < level) {
      gameState.spendMoney(cost);
      gameState.set({ clinicLevel: level });
      soundManager.playLevelUp();
      gameState.save();
    } else {
      soundManager.playError();
    }
  };

  const handleDecorPurchase = (id, cost) => {
    if (gameState.canAfford(cost)) {
      gameState.spendMoney(cost);
      const decor = { ...state.decorations };
      decor[id] = true;
      gameState.set({ decorations: decor });
      soundManager.playSuccess();
      gameState.save();
    } else {
      soundManager.playError();
    }
  };

  const upgrades = state.upgrades;
  const accent = TAB_ACCENTS[tab];

  const renderToolsTab = () =>
    TOOL_UPGRADES.map((tool) => {
      const owned = upgrades[tool.id];
      return (
        <PixelCard
          key={tool.id}
          color={owned ? COLORS.accentDark + '20' : COLORS.bgLight}
          borderColor={owned ? COLORS.green : TAB_ACCENTS.tools}
        >
          <View style={styles.itemRow}>
            <PixelText size="large" color={owned ? COLORS.green : COLORS.white}>
              {tool.icon}
            </PixelText>
            <View style={styles.itemInfo}>
              <View style={styles.itemHeader}>
                <PixelText size="normal" color={owned ? COLORS.green : COLORS.white}>
                  {tool.name}
                </PixelText>
                {owned ? (
                  <PixelText size="small" color={COLORS.green}>{t('purchased')}</PixelText>
                ) : (
                  <PixelText size="small" color={COLORS.gold} glow>${tool.cost}</PixelText>
                )}
              </View>
              <PixelText size="tiny" color={COLORS.gray} style={styles.desc}>
                {tool.description}
              </PixelText>
            </View>
          </View>
          {!owned && (
            <PixelButton
              title={state.money >= tool.cost ? t('buy') : t('notEnoughMoney')}
              color={state.money >= tool.cost ? COLORS.green : COLORS.grayDark}
              onPress={() => handlePurchase(tool.id, tool.cost)}
              disabled={state.money < tool.cost}
              small
            />
          )}
        </PixelCard>
      );
    });

  const renderClinicTab = () =>
    CLINIC_UPGRADES.map((upgrade) => {
      const currentLevel = upgrades[upgrade.id] || 1;
      const maxed = upgrade.levels.filter((l) => l.level > currentLevel).length === 0;
      return (
        <PixelCard key={upgrade.id} borderColor={TAB_ACCENTS.clinic} color={maxed ? COLORS.accentDark + '20' : COLORS.bgLight}>
          <View style={styles.itemHeader}>
            <PixelText size="normal" color={TAB_ACCENTS.clinic}>
              {upgrade.name}
            </PixelText>
            <PixelText size="tiny" color={COLORS.gray}>
              {t('currentLevel')}: {currentLevel}
            </PixelText>
          </View>
          {/* Progress bar */}
          <View style={styles.progressBar}>
            {upgrade.levels.map((l) => (
              <View
                key={l.level}
                style={[
                  styles.progressSegment,
                  {
                    backgroundColor: currentLevel >= l.level ? TAB_ACCENTS.clinic : COLORS.grayDark,
                    flex: 1,
                  },
                ]}
              />
            ))}
          </View>
          {upgrade.levels
            .filter((l) => l.level > currentLevel)
            .slice(0, 1)
            .map((level) => (
              <View key={level.level} style={styles.levelUpgrade}>
                <PixelText size="small" color={COLORS.white}>
                  {t('level')} {level.level}: {level.description}
                </PixelText>
                <PixelButton
                  title={`${t('upgrade')} - $${level.cost}`}
                  color={state.money >= level.cost ? TAB_ACCENTS.clinic : COLORS.grayDark}
                  onPress={() => handlePurchase(upgrade.id, level.cost)}
                  disabled={state.money < level.cost}
                  small
                />
              </View>
            ))}
          {maxed && (
            <PixelText size="small" color={COLORS.gold} style={styles.desc} glow>
              {t('maxLevel')}
            </PixelText>
          )}
        </PixelCard>
      );
    });

  const renderSkillsTab = () =>
    SKILL_UPGRADES.map((skill) => {
      const currentLevel = upgrades[skill.id] || 1;
      const maxed = skill.levels.filter((l) => l.level > currentLevel).length === 0;
      return (
        <PixelCard key={skill.id} borderColor={TAB_ACCENTS.skills} color={maxed ? COLORS.accentDark + '20' : COLORS.bgLight}>
          <View style={styles.itemHeader}>
            <PixelText size="normal" color={TAB_ACCENTS.skills}>
              {skill.name}
            </PixelText>
            <PixelText size="tiny" color={COLORS.gray}>
              {t('currentLevel')}: {currentLevel}
            </PixelText>
          </View>
          {/* Progress bar */}
          <View style={styles.progressBar}>
            {skill.levels.map((l) => (
              <View
                key={l.level}
                style={[
                  styles.progressSegment,
                  {
                    backgroundColor: currentLevel >= l.level ? TAB_ACCENTS.skills : COLORS.grayDark,
                    flex: 1,
                  },
                ]}
              />
            ))}
          </View>
          {skill.levels
            .filter((l) => l.level > currentLevel)
            .slice(0, 1)
            .map((level) => (
              <View key={level.level} style={styles.levelUpgrade}>
                <PixelText size="small" color={COLORS.white}>
                  {t('level')} {level.level}: {level.description}
                </PixelText>
                <PixelButton
                  title={`${t('study')} - $${level.cost}`}
                  color={state.money >= level.cost ? TAB_ACCENTS.skills : COLORS.grayDark}
                  onPress={() => handlePurchase(skill.id, level.cost)}
                  disabled={state.money < level.cost}
                  small
                />
              </View>
            ))}
          {maxed && (
            <PixelText size="small" color={COLORS.gold} style={styles.desc} glow>
              {t('masteryComplete')}
            </PixelText>
          )}
        </PixelCard>
      );
    });

  const renderStaffTab = () => (
    <>
      {/* Staff chain header */}
      <PixelCard borderColor={TAB_ACCENTS.staff} color={COLORS.bgMedium}>
        <PixelText size="normal" color={TAB_ACCENTS.staff} glow>
          {t('staffChain')}
        </PixelText>
        <PixelText size="tiny" color={COLORS.gray} style={styles.desc}>
          {t('staffChainDesc')}
        </PixelText>
      </PixelCard>

      {STAFF_UPGRADES.map((staff, index) => {
        const owned = gameState.hasStaff(staff.id);
        const requiresMet = !staff.requires || gameState.hasStaff(staff.requires);
        const canBuy = requiresMet && !owned && state.money >= staff.cost;
        const locked = !requiresMet && !owned;

        // Find the required staff name for display
        const requiredStaff = staff.requires
          ? STAFF_UPGRADES.find((s) => s.id === staff.requires)
          : null;

        return (
          <View key={staff.id}>
            {/* Chain connector line */}
            {index > 0 && (
              <View style={styles.chainConnector}>
                <View
                  style={[
                    styles.chainLine,
                    { backgroundColor: owned || requiresMet ? TAB_ACCENTS.staff : COLORS.grayDark },
                  ]}
                />
                <PixelText size="tiny" color={owned || requiresMet ? TAB_ACCENTS.staff : COLORS.grayDark}>
                  {owned || requiresMet ? '\u25BC' : '\uD83D\uDD12'}
                </PixelText>
                <View
                  style={[
                    styles.chainLine,
                    { backgroundColor: owned || requiresMet ? TAB_ACCENTS.staff : COLORS.grayDark },
                  ]}
                />
              </View>
            )}

            <PixelCard
              color={owned ? COLORS.accentDark + '20' : locked ? COLORS.grayDark + '30' : COLORS.bgLight}
              borderColor={owned ? COLORS.green : locked ? COLORS.grayDark : TAB_ACCENTS.staff}
              style={locked ? styles.lockedCard : null}
            >
              <View style={styles.itemRow}>
                <View style={[styles.staffIcon, { borderColor: owned ? COLORS.green : locked ? COLORS.grayDark : TAB_ACCENTS.staff }]}>
                  <PixelText size="large" color={locked ? COLORS.grayDark : COLORS.white}>
                    {locked ? '\uD83D\uDD12' : staff.icon}
                  </PixelText>
                </View>
                <View style={styles.itemInfo}>
                  <View style={styles.itemHeader}>
                    <PixelText
                      size="normal"
                      color={owned ? COLORS.green : locked ? COLORS.grayDark : COLORS.white}
                    >
                      {t(staff.name)}
                    </PixelText>
                    {owned ? (
                      <PixelText size="small" color={COLORS.green} glow>
                        {t('hired')}
                      </PixelText>
                    ) : (
                      <PixelText size="small" color={locked ? COLORS.grayDark : COLORS.gold} glow={!locked}>
                        ${staff.cost}
                      </PixelText>
                    )}
                  </View>
                  <PixelText
                    size="tiny"
                    color={locked ? COLORS.grayDark : COLORS.gray}
                    style={styles.desc}
                  >
                    {t(staff.description)}
                  </PixelText>
                  {locked && requiredStaff && (
                    <View style={styles.requiresRow}>
                      <PixelText size="tiny" color={COLORS.red}>
                        {t('requires')}: {t(requiredStaff.name)}
                      </PixelText>
                    </View>
                  )}
                </View>
              </View>

              {/* Action area */}
              {owned && (
                <View style={styles.ownedBadge}>
                  <PixelText size="small" color={COLORS.green} glow>
                    \u2714 {t('working')}
                  </PixelText>
                </View>
              )}
              {!owned && requiresMet && (
                <PixelButton
                  title={canBuy ? t('hire') : t('notEnoughMoney')}
                  color={canBuy ? TAB_ACCENTS.staff : COLORS.grayDark}
                  onPress={() => handleStaffPurchase(staff.id, staff.cost)}
                  disabled={!canBuy}
                  small
                />
              )}
            </PixelCard>
          </View>
        );
      })}
    </>
  );

  const renderExpandTab = () => (
    <>
      <PixelCard borderColor={TAB_ACCENTS.expand} color={COLORS.bgMedium}>
        <View style={styles.itemHeader}>
          <PixelText size="normal" color={TAB_ACCENTS.expand} glow>
            {t('currentClinic')}
          </PixelText>
          <PixelText size="normal" color={COLORS.gold} glow>
            {t('level')} {state.clinicLevel}
          </PixelText>
        </View>
        <PixelText size="tiny" color={COLORS.gray} style={styles.desc}>
          {t('expandDesc')}
        </PixelText>
      </PixelCard>

      {CLINIC_EXPANSION.map((exp) => {
        const available = state.clinicLevel < exp.level;
        const done = state.clinicLevel >= exp.level;
        const canBuild = available && state.clinicLevel === exp.level - 1;
        return (
          <PixelCard
            key={exp.level}
            color={done ? COLORS.accentDark + '20' : COLORS.bgLight}
            borderColor={done ? COLORS.green : canBuild ? TAB_ACCENTS.expand : COLORS.grayDark}
          >
            <View style={styles.itemHeader}>
              <PixelText size="normal" color={done ? COLORS.green : TAB_ACCENTS.expand}>
                {exp.name}
              </PixelText>
              {done && (
                <PixelText size="small" color={COLORS.green} glow>
                  {t('built')}
                </PixelText>
              )}
            </View>
            <PixelText size="small" color={COLORS.white} style={styles.desc}>
              {exp.description}
            </PixelText>
            {done ? (
              <View style={styles.ownedBadge}>
                <PixelText size="small" color={COLORS.green} glow>
                  \u2714 {t('constructed')}
                </PixelText>
              </View>
            ) : canBuild ? (
              <PixelButton
                title={`${t('build')} - $${exp.cost}`}
                color={state.money >= exp.cost ? TAB_ACCENTS.expand : COLORS.grayDark}
                onPress={() => handleClinicExpansion(exp.level, exp.cost)}
                disabled={state.money < exp.cost}
                small
              />
            ) : (
              <PixelText size="tiny" color={COLORS.grayDark}>
                {t('requires')}: {t('level')} {exp.level - 1}
              </PixelText>
            )}
          </PixelCard>
        );
      })}
    </>
  );

  return (
    <View style={styles.container}>
      <BackHeader title="TIENDA" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerDecor}>
            <View style={[styles.decorLine, { backgroundColor: accent }]} />
            <PixelText size="large" color={accent} glow>
              {t('shop')}
            </PixelText>
            <View style={[styles.decorLine, { backgroundColor: accent }]} />
          </View>
          <View style={styles.moneyDisplay}>
            <View style={[styles.moneyBadge, { borderColor: COLORS.gold }]}>
              <PixelText size="medium" color={COLORS.gold} glow>
                ${state.money}
              </PixelText>
            </View>
          </View>
        </View>

        {/* Sala Abierta — table unlock section */}
        {gameState.get('clinicMode') === 'salaAbierta' && (
          <View style={styles.section}>
            <PixelText size="medium" color={COLORS.gold}>🛏 CAMILLAS</PixelText>
            {[
              { table: 3, cost: 500 },
              { table: 4, cost: 1200 },
              { table: 5, cost: 2500 },
              { table: 6, cost: 5000 },
            ].map(({ table, cost }) => {
              const unlocked = (gameState.get('unlockedTables') || 2) >= table;
              const canAfford = (gameState.get('money') || 0) >= cost;
              return (
                <View key={table} style={styles.upgradeRow}>
                  <PixelText size="small" color={unlocked ? COLORS.accent : COLORS.white}>
                    {unlocked ? '✓' : '🔒'} Camilla {table}
                  </PixelText>
                  {!unlocked && (
                    <PixelButton
                      title={`$${cost}`}
                      color={canAfford ? COLORS.primary : COLORS.grayDark}
                      disabled={!canAfford}
                      onPress={() => {
                        if (!canAfford) return;
                        gameState.set({ money: (gameState.get('money') || 0) - cost });
                        gameState.set({ unlockedTables: table });
                        soundManager.playSuccess();
                      }}
                      small
                    />
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabs}>
          {TABS.map((tabItem) => (
            <PixelButton
              key={tabItem.id}
              title={`${tabItem.icon} ${t(tabItem.labelKey)}`}
              color={tab === tabItem.id ? TAB_ACCENTS[tabItem.id] : COLORS.dark}
              onPress={() => { setTab(tabItem.id); soundManager.playClick(); }}
              small
              style={[
                styles.tab,
                tab === tabItem.id && styles.tabActive,
                tab === tabItem.id && { borderBottomColor: TAB_ACCENTS[tabItem.id], borderBottomWidth: 2 },
              ]}
            />
          ))}
        </View>

        {/* Tab indicator bar */}
        <View style={[styles.tabIndicator, { backgroundColor: accent }]} />

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {tab === 'tools' && renderToolsTab()}
          {tab === 'clinic' && renderClinicTab()}
          {tab === 'skills' && renderSkillsTab()}
          {tab === 'staff' && renderStaffTab()}
          {tab === 'expand' && renderExpandTab()}
          {tab === 'decor' && renderDecorTab()}
        </View>

        {/* Back button */}
        <View style={styles.backSection}>
          <View style={[styles.decorLine, { backgroundColor: COLORS.grayDark }]} />
          <PixelButton
            title={t('back')}
            icon={'\u2190'}
            color={COLORS.dark}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 12,
    paddingTop: 40,
    paddingBottom: 40,
  },
  // Header
  header: {
    marginBottom: 12,
    gap: 8,
  },
  headerDecor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  decorLine: {
    flex: 1,
    height: 2,
    borderRadius: 1,
  },
  moneyDisplay: {
    alignItems: 'center',
    marginTop: 4,
  },
  moneyBadge: {
    borderWidth: 1.5,
    borderStyle: 'solid',
    borderRadius: 8,
    backgroundColor: COLORS.paper,
    paddingHorizontal: 24,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  // Tabs
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 0,
  },
  tab: {
    flex: 1,
    minWidth: '18%',
  },
  tabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  tabIndicator: {
    height: 2,
    borderRadius: 1,
    marginBottom: 12,
  },
  tabContent: {
    gap: 4,
  },
  // Items
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 6,
  },
  itemInfo: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  desc: {
    marginVertical: 3,
  },
  // Progress bars
  progressBar: {
    flexDirection: 'row',
    gap: 3,
    height: 8,
    marginVertical: 6,
    borderRadius: 2,
  },
  progressSegment: {
    height: 8,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  levelUpgrade: {
    marginTop: 6,
    gap: 4,
  },
  // Staff
  staffIcon: {
    width: 44,
    height: 44,
    borderWidth: 1.5,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.paperDark,
  },
  chainConnector: {
    alignItems: 'center',
    gap: 0,
    marginVertical: -2,
  },
  chainLine: {
    width: 2,
    height: 10,
    borderRadius: 1,
  },
  lockedCard: {
    opacity: 0.6,
  },
  requiresRow: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayDark,
  },
  ownedBadge: {
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 2,
    borderTopColor: COLORS.accent,
    borderStyle: 'dashed',
  },
  // Sala Abierta upgrades
  section: { marginBottom: 20 },
  upgradeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  // Back
  backSection: {
    marginTop: 16,
    gap: 8,
  },
  backButton: {
    marginTop: 4,
  },
});

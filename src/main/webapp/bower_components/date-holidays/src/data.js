export const data = {
  version: '2022-07-01',
  license: 'CC-BY-SA-3',
  holidays: {
    AD: {
      names: {
        ca: 'Andorra',
        es: 'Andorra',
        en: 'Andorra'
      },
      dayoff: 'sunday',
      langs: [
        'ca',
        'es'
      ],
      zones: [
        'Europe/Andorra'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-06': {
          _name: '01-06'
        },
        '03-14': {
          _name: 'Constitution Day'
        },
        '05-01': {
          _name: '05-01'
        },
        '08-15': {
          _name: '08-15'
        },
        '09-08': {
          name: {
            en: 'Our Lady of Meritxell',
            es: 'Nuestra Sra. De Meritxell',
            ca: 'Mare de Déu de Meritxell'
          }
        },
        '11-01': {
          _name: '11-01'
        },
        '12-08': {
          _name: '12-08'
        },
        '12-24': {
          type: 'bank',
          _name: '12-24'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        },
        'easter -47': {
          _name: 'easter -47'
        },
        'easter -3 14:00': {
          type: 'bank',
          _name: 'easter -3'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        'easter 49': {
          _name: 'easter 49'
        },
        'easter 50': {
          _name: 'easter 50'
        }
      },
      regions: {
        '07': {
          name: 'Andorra la Vella',
          days: {
            '1st saturday in August P3D': {
              name: {
                en: 'Andorra La Vella Festival',
                ca: 'Andorra La Vella Festival'
              }
            }
          }
        }
      }
    },
    AE: {
      names: {
        en: 'United Arab Emirates',
        ar: 'دولة الإمارات العربية المتحدة'
      },
      langs: [
        'ar'
      ],
      zones: [
        'Asia/Dubai'
      ],
      dayoff: '',
      days: {
        '01-01': {
          _name: '01-01',
          name: {
            ar: 'رأس السنة الميلادية'
          }
        },
        '12-02': {
          name: {
            en: 'National Day',
            ar: 'اليوم الوطني'
          }
        },
        '1 Muharram': {
          _name: '1 Muharram'
        },
        '1 Shawwal P3D': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah P3D': {
          _name: '10 Dhu al-Hijjah'
        },
        '27 Rajab': {
          _name: '27 Rajab'
        },
        '1 Ramadan': {
          _name: '1 Ramadan'
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal'
        }
      }
    },
    AG: {
      names: {
        en: 'Antigua & Barbuda'
      },
      langs: [
        'en'
      ],
      dayoff: 'sunday',
      weekend: [
        'saturday',
        'sunday'
      ],
      zones: [
        'America/Port_of_Spain'
      ],
      days: {
        '01-01 and if sunday then next monday': {
          substitute: true,
          _name: '01-01'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01'
        },
        'easter 49': {
          _name: 'easter 49',
          type: 'observance'
        },
        'easter 50': {
          _name: 'easter 50'
        },
        '08-01': {
          name: {
            en: "J'Ouvert Morning"
          }
        },
        '08-02': {
          name: {
            en: 'Last Lap'
          }
        },
        '11-01 if saturday,sunday then next monday': {
          _name: 'Independence Day'
        },
        '12-09': {
          name: {
            en: 'V.C Bird Day'
          }
        },
        '12-25 and if saturday then next monday if sunday then next tuesday': {
          _name: '12-25',
          substitute: true
        },
        '12-26 and if sunday then next monday': {
          _name: '12-26',
          substitute: true
        }
      },
      regions: {
        10: {
          name: 'Barbuda',
          days: {
            'easter 47 P4D': {
              name: {
                en: 'Caribana'
              },
              type: 'observance'
            }
          }
        }
      }
    },
    AI: {
      names: {
        en: 'Anguilla'
      },
      langs: [
        'en'
      ],
      dayoff: 'sunday',
      weekend: [
        'saturday',
        'sunday'
      ],
      zones: [
        'America/Port_of_Spain'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '03-02': {
          name: {
            en: 'James Ronald Webster Day'
          }
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01'
        },
        '05-30': {
          name: {
            en: 'Anguilla Day'
          }
        },
        'easter 49': {
          _name: 'easter 49',
          type: 'observance'
        },
        'easter 50': {
          _name: 'easter 50'
        },
        '2nd monday in June': {
          name: {
            en: 'Celebration of the Birthday of Her Majesty the Queen'
          }
        },
        '1st monday in August': {
          name: {
            en: 'August Monday'
          }
        },
        '1st thursday in August': {
          name: {
            en: 'August Thursday'
          }
        },
        '1st friday in August': {
          _name: 'Constitution Day'
        },
        '12-19': {
          name: {
            en: 'National Heroes and Heroines Day'
          }
        },
        '12-25 and if saturday then next monday if sunday then next tuesday': {
          _name: '12-25',
          substitute: true
        },
        '12-26 and if sunday then next monday': {
          _name: '12-26',
          substitute: true
        }
      }
    },
    AL: {
      names: {
        sq: 'Shqipëri',
        en: 'Albania'
      },
      dayoff: 'sunday',
      langs: [
        'sq',
        'es'
      ],
      zones: [
        'Europe/Tirane'
      ],
      days: {
        '01-01 and if sunday then next tuesday': {
          _name: '01-01',
          substitute: true
        },
        '01-02 and if sunday then next monday': {
          name: {
            sq: 'Festa e Vitit të Ri',
            en: 'New Year Holiday'
          },
          substitute: true
        },
        '03-02': {
          name: {
            sq: 'Dita e Besëlidhjes së Lezhës',
            en: 'League of Lezhë day'
          },
          type: 'observance'
        },
        '03-07': {
          name: {
            sq: 'Dita e Mësuesit',
            en: "Teacher's Day"
          },
          type: 'observance'
        },
        '03-08': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        '03-14 and if sunday then next monday': {
          name: {
            sq: 'Dita e Verës',
            en: 'Summer Day'
          },
          substitute: true
        },
        '03-22 and if sunday then next monday': {
          name: {
            sq: 'Dita e Sulltan Nevruzit',
            en: "Sultan Nevruz's Day"
          },
          substitute: true
        },
        '04-01': {
          _name: '04-01',
          type: 'observance'
        },
        easter: {
          name: {
            sq: 'Pashkët Katolike',
            en: 'Catholic Easter'
          }
        },
        'easter 1': {
          name: {
            sq: 'Pashkët Katolike',
            en: 'Catholic Easter'
          }
        },
        orthodox: {
          name: {
            sq: 'Pashkët Ortodokse',
            en: 'Orthodox Easter'
          }
        },
        'orthodox 1': {
          name: {
            sq: 'Pashkët Ortodokse',
            en: 'Orthodox Easter'
          }
        },
        '05-01 and if sunday then next monday': {
          _name: '05-01',
          substitute: true
        },
        '06-01': {
          name: {
            sq: 'Dita Ndërkombëtare e Fëmijëve',
            en: "Children's Day"
          },
          type: 'observance'
        },
        '10-19 and if sunday then next monday': {
          name: {
            sq: 'Dita e Nënë Terezës',
            en: 'Mother Teresa Day'
          },
          substitute: true,
          active: [
            {
              from: 2004
            }
          ]
        },
        '11-22': {
          name: {
            sq: 'Dita e Alfabetit',
            en: 'Alphabet Day'
          },
          type: 'observance'
        },
        '11-28 and if sunday then next monday': {
          _name: 'Independence Day',
          substitute: true
        },
        '11-29 and if sunday then next monday': {
          _name: 'Liberation Day',
          substitute: true
        },
        '12-08 and if sunday then next monday': {
          name: {
            sq: 'Dita Kombëtare e Rinisë',
            en: 'Youth Day'
          },
          substitute: true,
          active: [
            {
              from: 2010
            }
          ]
        },
        '12-24': {
          _name: '12-24',
          type: 'bank'
        },
        '12-25 and if sunday then next monday': {
          _name: '12-25',
          substitute: true
        },
        '1 Shawwal': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah'
        }
      },
      regions: {}
    },
    AM: {
      names: {
        hy: 'Հայաստան',
        en: 'Armenia'
      },
      dayoff: 'sunday',
      langs: [
        'hy'
      ],
      zones: [
        'Asia/Yerevan'
      ],
      days: {
        '12-31': {
          _name: '12-31'
        },
        '01-01 P2D': {
          _name: '01-01'
        },
        '01-03 P3D': {
          name: {
            en: 'Pre-Christmas holidays',
            hy: 'Նախածննդյան տոներ'
          }
        },
        '01-06': {
          _name: '12-25'
        },
        '01-28': {
          name: {
            en: 'Army Day',
            hy: 'Բանակի օր'
          }
        },
        '02-21': {
          name: {
            en: 'Mother Language Day',
            hy: 'Մայրենի լեզվի օր'
          },
          type: 'observance'
        },
        'easter -52': {
          name: {
            en: 'St. Vartan the good work and the duty days',
            hy: 'Սուրբ Վարդանանց տոն՝ բարի գործի եւ ազգային տուրքի օր'
          },
          type: 'observance'
        },
        '03-08': {
          _name: '03-08'
        },
        '04-07': {
          name: {
            en: 'Motherhood and Beauty Day',
            hy: 'Մայրության, գեղեցկության եւ սիրո տոն'
          },
          type: 'observance'
        },
        '04-24': {
          _name: 'Mothers Day'
        },
        '05-01': {
          _name: '05-01'
        },
        '05-08': {
          name: {
            en: 'Yerkrapah Day',
            hy: 'Երկրապահի օր'
          },
          type: 'observance'
        },
        '05-09': {
          name: {
            en: 'Victory and Peace Day',
            hy: 'Հաղթանակի եւ Խաղաղության տոն'
          }
        },
        '05-28': {
          name: {
            en: 'Republic Day',
            hy: 'Հանրապետության օր'
          }
        },
        '06-01': {
          name: {
            en: 'The day of protection of children rights',
            hy: 'Երեխաների իրավունքների պաշտպանության օր'
          },
          type: 'observance'
        },
        '07-05': {
          _name: 'Constitution Day'
        },
        '09-01': {
          name: {
            en: 'Knowledge, Literacy and Education Day',
            hy: 'Գիտելիքի, գրի եւ դպրության օր'
          },
          type: 'observance'
        },
        '09-21': {
          _name: 'Independence Day'
        },
        '2nd saturday in October': {
          name: {
            en: "Translator's Day",
            hy: 'Թարգմանչաց տոն'
          },
          type: 'observance'
        },
        '12-07': {
          name: {
            en: 'Earthquake Remembrance Day',
            hy: 'Երկրաշարժի զոհերի հիշատակի օր'
          },
          type: 'observance'
        }
      }
    },
    AO: {
      names: {
        pt: 'Angola',
        en: 'Angola'
      },
      dayoff: 'sunday',
      zones: [
        'Africa/Lagos'
      ],
      langs: [
        'pt'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '02-04': {
          name: {
            pt: 'Dia do Início da Luta Armada de Libertação Nacional',
            en: 'Liberation Day'
          }
        },
        'easter -47': {
          _name: 'easter -47'
        },
        '03-08': {
          name: {
            pt: 'Dia Internacional da Mulher',
            en: "International Woman's Day"
          }
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        '04-04': {
          name: {
            pt: 'Dia da Paz',
            en: 'Peace Day'
          }
        },
        '05-01': {
          _name: '05-01'
        },
        '1st sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        '09-17': {
          name: {
            pt: 'Fundador da Nação e Dia dos Heróis Nacionais',
            en: 'National Hero Day'
          }
        },
        '11-02': {
          _name: '11-02'
        },
        '11-11': {
          _name: 'Independence Day'
        },
        '12-25': {
          _name: '12-25'
        }
      }
    },
    AR: {
      names: {
        es: 'Argentina',
        en: 'Argentina'
      },
      dayoff: 'sunday',
      langs: [
        'es'
      ],
      zones: [
        'America/Argentina/Buenos_Aires',
        'America/Argentina/Cordoba',
        'America/Argentina/Salta',
        'America/Argentina/Jujuy',
        'America/Argentina/Tucuman',
        'America/Argentina/Catamarca',
        'America/Argentina/La_Rioja',
        'America/Argentina/San_Juan',
        'America/Argentina/Mendoza',
        'America/Argentina/San_Luis',
        'America/Argentina/Rio_Gallegos',
        'America/Argentina/Ushuaia'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        'substitutes 01-01 if tuesday then previous monday if thursday then next friday': {
          _name: 'Bridge Day',
          disable: [
            2015
          ]
        },
        'easter -48': {
          _name: 'easter -48'
        },
        'easter -47': {
          _name: 'easter -47'
        },
        '03-24': {
          name: {
            en: 'Day of Remembrance for Truth and Justice',
            es: 'Día de la Memoria por la Verdad y la Justicia'
          }
        },
        'substitutes 03-24 if tuesday then previous monday if thursday then next friday': {
          _name: 'Bridge Day'
        },
        '2020-03-30': {
          _name: 'Bridge Day'
        },
        'easter -3': {
          _name: 'easter -3'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        '04-02': {
          name: {
            en: 'Day of the veterans and the fallen in Malvinas War',
            es: 'Día del Veterano y de los Caídos en la Guerra de Malvinas'
          }
        },
        'substitutes 04-02 if tuesday then previous monday if thursday then next friday': {
          _name: 'Bridge Day'
        },
        '05-01': {
          _name: '05-01'
        },
        'substitutes 05-01 if tuesday then previous monday if thursday then next friday': {
          _name: 'Bridge Day'
        },
        '05-25': {
          name: {
            en: 'Day of the First National Government',
            es: 'Primer Gobierno Patrio'
          }
        },
        'substitutes 05-25 if tuesday then previous monday if thursday then next friday': {
          _name: 'Bridge Day'
        },
        '06-20': {
          name: {
            en: 'National Flag Day',
            es: 'Día de la Bandera'
          }
        },
        'substitutes 06-20 if tuesday then previous monday if thursday then next friday': {
          _name: 'Bridge Day'
        },
        '07-09': {
          _name: 'Independence Day'
        },
        'substitutes 07-09 if tuesday then previous monday if thursday then next friday if saturday then previous friday': {
          _name: 'Bridge Day',
          disable: [
            2015,
            2022
          ]
        },
        '3rd monday in August': {
          name: {
            en: 'Anniversary of the death of General José de San Martín',
            es: 'Día del Libertador José de San Martín'
          }
        },
        '10-12 if tuesday,wednesday then previous monday if thursday,friday,saturday,sunday then next monday': {
          name: {
            en: 'Day of Respect for Cultural Diversity',
            es: 'Día del Respeto a la Diversidad Cultural'
          }
        },
        'substitutes 10-12 if monday,tuesday,wednesday then previous friday': {
          _name: 'Bridge Day',
          disable: [
            2015,
            2016,
            2020
          ]
        },
        '11-20 if tuesday,wednesday then previous monday if friday then next monday': {
          name: {
            en: 'Day of National Sovereignty',
            es: 'Día de la Soberanía nacional'
          }
        },
        'substitutes 11-20 if saturday,sunday then next monday': {
          _name: 'Bridge Day',
          disable: [
            2016
          ]
        },
        '12-08': {
          _name: '12-08'
        },
        'substitutes 12-08 if tuesday then previous monday if thursday then next friday': {
          _name: 'Bridge Day'
        },
        '12-24 12:00': {
          _name: '12-24',
          type: 'optional'
        },
        'substitutes 12-24 if tuesday then previous monday': {
          _name: 'Bridge Day'
        },
        '12-25': {
          _name: '12-25'
        },
        'substitutes 12-25 if tuesday then previous monday if thursday then next friday': {
          _name: 'Bridge Day'
        },
        '12-31 12:00': {
          _name: '12-31',
          type: 'optional'
        }
      }
    },
    AS: {
      names: {
        en: 'American Samoa'
      },
      dayoff: 'sunday',
      zones: [
        'Pacific/Pago_Pago'
      ],
      langs: [
        'en'
      ],
      _days: [
        'US'
      ],
      days: {
        '3rd monday in February': {
          name: {
            en: "Washington's Birthday"
          }
        },
        '03-17': false,
        '04-15 if friday then next monday if saturday,sunday then next tuesday': false,
        '04-17 and if sunday then next monday': {
          name: {
            en: 'American Samoa Flag Day'
          },
          substitute: true
        },
        '07-16': {
          name: {
            en: "Manu'a Cession Day"
          },
          type: 'optional',
          note: 'Goverment offices closed'
        },
        '2nd sunday in October': {
          name: {
            en: 'White Sunday'
          },
          type: 'observance',
          note: 'christian'
        },
        '12-24 12:00': {
          _name: '12-24',
          type: 'bank'
        },
        '12-31 12:00': {
          _name: '12-31',
          type: 'bank'
        }
      }
    },
    AT: {
      names: {
        'de-at': 'Österreich',
        en: 'Austria'
      },
      dayoff: 'sunday',
      zones: [
        'Europe/Vienna'
      ],
      langs: [
        'de-at',
        'de'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-06': {
          _name: '01-06'
        },
        'easter -2 prior to 2019': {
          _name: 'easter -2',
          type: 'optional'
        },
        'easter -1': {
          _name: 'easter -1',
          type: 'observance'
        },
        easter: {
          _name: 'easter'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01': {
          name: {
            'de-at': 'Staatsfeiertag'
          }
        },
        '2nd sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        'easter 39': {
          _name: 'easter 39'
        },
        'easter 49': {
          _name: 'easter 49'
        },
        'easter 50': {
          _name: 'easter 50'
        },
        'easter 60': {
          _name: 'easter 60'
        },
        '08-15': {
          _name: '08-15'
        },
        '10-26': {
          _name: 'National Holiday'
        },
        '11-01': {
          _name: '11-01'
        },
        '12-08': {
          _name: '12-08'
        },
        '12-24 14:00 if sunday then 00:00': {
          _name: '12-24',
          type: 'bank'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        },
        '12-31 14:00 if sunday then 00:00': {
          _name: '12-31',
          type: 'bank'
        }
      },
      states: {
        1: {
          name: 'Burgenland',
          days: {
            '11-11': {
              name: {
                'de-at': 'Martinstag'
              }
            }
          }
        },
        2: {
          names: {
            de: 'Kärnten',
            en: 'Carinthia'
          },
          days: {
            '03-19': {
              _name: '03-19'
            },
            '10-10': {
              name: {
                'de-at': 'Tag der Volksabstimmung'
              }
            }
          }
        },
        3: {
          names: {
            de: 'Niederösterreich',
            en: 'Lower Austria'
          },
          days: {
            '11-15': {
              name: {
                'de-at': 'Leopold'
              }
            }
          }
        },
        4: {
          names: {
            de: 'Oberösterreich',
            en: 'Upper Austria'
          },
          days: {
            '05-04': {
              name: {
                'de-at': 'Florian'
              }
            }
          }
        },
        5: {
          names: {
            de: 'Land Salzburg',
            en: 'Salzburg'
          },
          days: {
            '09-24': {
              name: {
                'de-at': 'Rupert'
              }
            }
          }
        },
        6: {
          names: {
            de: 'Steiermark',
            en: 'Styria'
          },
          days: {
            '03-19': {
              _name: '03-19'
            }
          }
        },
        7: {
          names: {
            de: 'Tirol',
            en: 'Tyrol'
          },
          days: {
            '03-19': {
              _name: '03-19'
            }
          }
        },
        8: {
          name: 'Vorarlberg',
          days: {
            '03-19': {
              _name: '03-19'
            }
          }
        },
        9: {
          names: {
            de: 'Wien',
            en: 'Vienna'
          },
          days: {
            '11-15': {
              name: {
                'de-at': 'Leopold'
              }
            }
          }
        }
      }
    },
    AU: {
      names: {
        en: 'Australia'
      },
      dayoff: 'sunday',
      langs: [
        'en'
      ],
      zones: [
        'Australia/Sydney',
        'Australia/Lord_Howe',
        'Antarctica/Macquarie',
        'Australia/Hobart',
        'Australia/Currie',
        'Australia/Melbourne',
        'Australia/Broken_Hill',
        'Australia/Brisbane',
        'Australia/Lindeman',
        'Australia/Adelaide',
        'Australia/Darwin',
        'Australia/Perth',
        'Australia/Eucla'
      ],
      days: {
        '01-01 and if saturday,sunday then next monday': {
          _name: '01-01'
        },
        '01-26 if saturday,sunday then next monday': {
          substitute: true,
          name: {
            en: 'Australia Day'
          }
        },
        'easter -2': {
          _name: 'easter -2'
        },
        'easter -1': {
          _name: 'easter -1'
        },
        easter: {
          _name: 'easter'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '04-25': {
          name: {
            en: 'Anzac Day'
          }
        },
        '2nd sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        '1st sunday in September': {
          _name: 'Fathers Day',
          type: 'observance'
        },
        '12-25 and if saturday then next monday if sunday then next tuesday': {
          substitute: true,
          _name: '12-25'
        },
        '12-26 and if saturday then next monday if sunday then next tuesday': {
          substitute: true,
          _name: '12-26'
        }
      },
      states: {
        ACT: {
          name: 'Australian Capital Territory',
          zones: [
            'Australia/Sydney'
          ],
          days: {
            '2nd monday in March': {
              name: {
                en: 'Canberra Day'
              }
            },
            '04-25': false,
            '04-25 if sunday then next monday': {
              substitute: true,
              name: {
                en: 'Anzac Day'
              }
            },
            '2020-04-27': {
              name: {
                en: 'Declared public holiday'
              },
              type: 'public'
            },
            'monday after 05-27': {
              name: {
                en: 'Reconciliation Day'
              }
            },
            '2nd monday in June': {
              name: {
                en: "Queen's Birthday"
              }
            },
            '1st monday in October': {
              name: {
                en: 'Labour Day'
              }
            }
          }
        },
        NSW: {
          name: 'New South Wales',
          zones: [
            'Australia/Sydney'
          ],
          days: {
            '2nd monday in June': {
              name: {
                en: "Queen's Birthday"
              }
            },
            '1st monday in August': {
              name: {
                en: 'Bank Holiday'
              },
              type: 'bank'
            },
            '1st monday in October': {
              name: {
                en: 'Labour Day'
              }
            }
          }
        },
        NT: {
          name: 'Northern Territory',
          zones: [
            'Australia/Darwin'
          ],
          days: {
            easter: false,
            '04-25': false,
            '04-25 if sunday then next monday': {
              substitute: true,
              name: {
                en: 'Anzac Day'
              }
            },
            '1st monday in May': {
              name: {
                en: 'May Day'
              }
            },
            '2nd monday in June': {
              name: {
                en: "Queen's Birthday"
              }
            },
            '1st monday in August': {
              name: {
                en: 'Picnic Day'
              }
            },
            '1st monday in October': false,
            '12-24 19:00': {
              _name: '12-24'
            },
            '12-25 and if saturday then next monday if sunday then next tuesday': false,
            '12-25 if saturday then next monday if sunday then next tuesday': {
              substitute: true,
              _name: '12-25'
            },
            '12-26 and if saturday then next monday if sunday then next tuesday': false,
            '12-26 if saturday then next monday if sunday then next tuesday': {
              substitute: true,
              _name: '12-26'
            },
            '12-31 19:00': {
              _name: '12-31'
            }
          }
        },
        QLD: {
          name: 'Queensland',
          zones: [
            'Australia/Brisbane',
            'Australia/Lindeman'
          ],
          days: {
            '04-25': false,
            '04-25 if sunday then next monday': {
              substitute: true,
              name: {
                en: 'Anzac Day'
              }
            },
            '1st monday in May': {
              name: {
                en: 'Labour Day'
              }
            },
            '2nd monday in June': false,
            '1st monday in October': {
              name: {
                en: "Queen's Birthday"
              }
            },
            '12-24 18:00': {
              _name: '12-24'
            }
          }
        },
        SA: {
          name: 'South Australia',
          zones: [
            'Australia/Adelaide'
          ],
          days: {
            easter: false,
            '2nd monday in March': {
              name: {
                en: 'Adelaide Cup Day'
              }
            },
            '2nd monday in June': {
              name: {
                en: "Queen's Birthday"
              }
            },
            '1st monday in October': {
              name: {
                en: 'Labour Day'
              }
            },
            '12-24 19:00': {
              _name: '12-24'
            },
            '12-25 and if saturday then next monday if sunday then next tuesday': false,
            '12-25 if saturday then next monday if sunday then next tuesday': {
              substitute: true,
              _name: '12-25'
            },
            '12-26 and if saturday then next monday if sunday then next tuesday': false,
            '12-26 if saturday then next monday if sunday then next tuesday': {
              substitute: true,
              name: 'Proclamation Day'
            },
            '12-31 19:00': {
              _name: '12-31'
            }
          }
        },
        TAS: {
          name: 'Tasmania',
          zones: [
            'Australia/Hobart'
          ],
          days: {
            '01-01 and if saturday,sunday then next monday': false,
            '01-01 if saturday then next monday if sunday then next tuesday': {
              substitute: true,
              _name: '01-01'
            },
            '2nd monday in March': {
              name: {
                en: 'Eight Hours Day'
              }
            },
            'easter -1': false,
            easter: false,
            'easter +2': {
              name: 'Easter Tuesday',
              type: 'optional',
              note: 'Public Service employees or contract dependent'
            },
            '2nd monday in June': {
              name: {
                en: "Queen's Birthday"
              }
            },
            '1st monday in October': false,
            '12-26 and if saturday then next monday if sunday then next tuesday': false,
            '12-26 if saturday then next monday if sunday then next tuesday': {
              substitute: true,
              _name: '12-26'
            }
          }
        },
        VIC: {
          name: 'Victoria',
          zones: [
            'Australia/Melbourne'
          ],
          days: {
            '2nd monday in March': {
              name: {
                en: 'Labour Day'
              }
            },
            '2nd monday in June': {
              name: {
                en: "Queen's Birthday"
              }
            },
            '1st monday in October': false,
            '1st friday before October': {
              name: {
                en: 'AFL Grand Final Friday'
              },
              note: 'Date might differ as dependent on AFL schedule'
            },
            '1st tuesday in November': {
              name: {
                en: 'Melbourne Cup'
              }
            }
          }
        },
        WA: {
          name: 'Western Australia',
          zones: [
            'Australia/Perth',
            'Australia/Eucla'
          ],
          days: {
            '1st monday in March': {
              name: {
                en: 'Labour Day'
              }
            },
            'easter -1': false,
            easter: false,
            '04-25': false,
            '04-25 and if saturday,sunday then next monday': {
              substitute: true,
              name: {
                en: 'Anzac Day'
              }
            },
            '1st monday in June': {
              name: {
                en: 'Western Australia Day'
              }
            },
            '2nd monday in June': false,
            'monday before October': {
              name: {
                en: "Queen's Birthday"
              },
              note: 'Might be on a different day; is proclaimed by Governor'
            },
            '1st monday in October': false
          }
        }
      }
    },
    AW: {
      names: {
        pap: 'Aruba',
        nl: 'Aruba',
        en: 'Aruba'
      },
      dayoff: 'sunday',
      zones: [
        'America/Curacao'
      ],
      langs: [
        'pap',
        'nl'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-25': {
          name: {
            pap: 'Dia di Betico',
            nl: 'Herdenking G. F. Croes',
            en: 'Betico Croes Day'
          }
        },
        'easter -48': {
          _name: 'easter -48'
        },
        '03-18 and if saturday then previous friday if sunday then next monday': {
          substitute: true,
          name: {
            pap: 'Dia di Himno y Bandera',
            nl: 'Herdenking Vlag en Volkslied',
            en: 'National Anthem and Flag Day'
          }
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '04-27': {
          name: {
            pap: 'Aña di Rey',
            nl: 'Koningsdag',
            en: 'Kings Day'
          }
        },
        '05-01 if sunday then next monday': {
          _name: '05-01'
        },
        '06-24': {
          name: {
            pap: 'Dera Gai',
            nl: 'Dera Gai',
            en: 'Dera Gai'
          },
          type: 'observance'
        },
        'easter 39': {
          _name: 'easter 39'
        },
        '12-05': {
          name: {
            nl: 'Sinterklaasavond',
            en: "St. Nicholas' Eve"
          },
          type: 'observance'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        }
      }
    },
    AX: {
      names: {
        sv: 'Landskapet Åland',
        en: 'Åland Islands'
      },
      dayoff: 'sunday',
      zones: [
        'Europe/Helsinki'
      ],
      langs: [
        'sv'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-06': {
          _name: '01-06'
        },
        '03-30': {
          name: {
            sv: 'Ålands demilitariseringsdag',
            en: 'Demilitarization Day'
          }
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01'
        },
        'easter 39': {
          _name: 'easter 39'
        },
        'easter 49': {
          _name: 'easter 49',
          type: 'observance'
        },
        '06-09': {
          name: {
            sv: 'Självstyrelsedagen',
            en: 'Autonomy Day'
          }
        },
        '3rd friday after 06-01 12:00': {
          name: {
            sv: 'Midsommarafton',
            en: 'Midsummer Eve'
          }
        },
        '3rd saturday after 06-01': {
          name: {
            sv: 'Midsommardagen',
            en: 'Midsummer Day'
          }
        },
        '12-06': {
          _name: 'Independence Day'
        },
        '12-24 12:00': {
          _name: '12-24',
          type: 'bank'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        },
        '12-31 12:00': {
          _name: '12-31',
          type: 'bank'
        }
      }
    },
    AZ: {
      names: {
        az: 'Azərbaycan Respublikası',
        en: 'Azerbaijan'
      },
      dayoff: 'sunday',
      weekend: [
        'saturday',
        'sunday'
      ],
      zones: [
        'Asia/Baku'
      ],
      langs: [
        'az'
      ],
      days: {
        '01-01 and if saturday then next monday if sunday then next tuesday': {
          substitute: true,
          _name: '01-01'
        },
        '01-02 and if saturday then next monday if sunday then next tuesday': {
          substitute: true,
          _name: '01-01'
        },
        '01-20': {
          name: {
            az: 'Qara Yanvar',
            en: "Martyrs' Day"
          },
          type: 'observance'
        },
        '03-08 and if saturday,sunday then next monday': {
          substitute: true,
          _name: '03-08'
        },
        '03-20': {
          name: {
            az: 'Novruz',
            en: 'Spring Festival'
          },
          active: [
            {
              from: 2011
            }
          ]
        },
        '05-09 and if saturday,sunday then next monday': {
          substitute: true,
          name: {
            az: 'Faşizm üzərində qələbə günü',
            en: 'Day of Victory over Fascism'
          }
        },
        '05-28 and if saturday,sunday then next monday': {
          substitute: true,
          name: {
            az: 'Respublika günü',
            en: 'Republic Day'
          }
        },
        '06-15 and if saturday,sunday then next monday': {
          substitute: true,
          name: {
            az: 'Azərbaycan xalqının Milli Qurtuluş günü',
            en: 'National Salvation Day'
          }
        },
        '06-26 and if saturday,sunday then next monday': {
          substitute: true,
          name: {
            az: 'Azərbaycan Respublikasının Silahlı Qüvvələri günü',
            en: 'Azerbaijan Armed Forces Day'
          }
        },
        '10-18 and if saturday,sunday then next monday': {
          substitute: true,
          name: {
            az: 'Dövlət Müstəqilliyi günü',
            en: 'Independence Day'
          }
        },
        '11-09 and if saturday,sunday then next monday': {
          substitute: true,
          name: {
            az: 'Dövlət Bayrağı günü',
            en: 'Flag Day'
          }
        },
        '11-12': {
          name: {
            az: 'Konstitusiya günü',
            en: 'Constitution Day'
          }
        },
        '11-17': {
          name: {
            az: 'Milli Dirçəliş günü',
            en: 'National Revival Day'
          }
        },
        '12-31 and if saturday,sunday then next monday': {
          substitute: true,
          name: {
            az: 'Dünya azərbaycanlıların həmrəyliyi günü',
            en: 'International Solidarity Day of Azerbaijanis'
          }
        },
        '1 Shawwal and if saturday then next monday if sunday then next tuesday': {
          substitute: true,
          _name: '1 Shawwal'
        },
        '2 Shawwal and if saturday then next monday if sunday then next tuesday': {
          substitute: true,
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah and if saturday then next monday if sunday then next tuesday': {
          substitute: true,
          _name: '10 Dhu al-Hijjah'
        },
        '11 Dhu al-Hijjah and if saturday then next monday if sunday then next tuesday': {
          substitute: true,
          _name: '10 Dhu al-Hijjah'
        }
      }
    },
    BA: {
      names: {
        bs: 'Bosna i Hercegovina',
        sr: 'Боснa и Херцеговина',
        hr: 'Bosna i Hercegovina',
        en: 'Bosnia and Herzegovina'
      },
      langs: [
        'bs',
        'sr',
        'hr'
      ],
      zones: [
        'Europe/Belgrade'
      ],
      dayoff: 'sunday',
      days: {
        '01-01 and if sunday then next tuesday': {
          _name: '01-01',
          substitute: true
        },
        '01-02 and if sunday then next monday': {
          name: {
            en: '2nd day of the New Year',
            bs: 'Drugi dan Nove Godine'
          },
          substitute: true
        },
        '05-01 and if sunday then next tuesday': {
          _name: '05-01',
          substitute: true
        },
        '05-02 and if sunday then next monday': {
          name: {
            en: '2nd day of the Labour Day',
            bs: 'Drugi dan Dana rada'
          },
          substitute: true
        },
        '01-06': {
          _name: '01-06'
        },
        easter: {
          _name: 'easter'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        'easter 60': {
          _name: 'easter 60'
        },
        '08-15': {
          _name: '08-15'
        },
        '11-01': {
          _name: '11-01'
        },
        '11-02': {
          _name: '11-02'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        },
        'julian 01-01': {
          _name: 'julian 01-01'
        },
        orthodox: {
          _name: 'orthodox'
        },
        'julian 08-15': {
          _name: '08-15',
          note: 'orthodox'
        },
        'julian 12-25': {
          _name: 'julian 12-25'
        },
        '1 Muharram': {
          _name: '1 Muharram'
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal'
        },
        '10 Dhu al-Hijjah P4D': {
          _name: '10 Dhu al-Hijjah'
        },
        '1 Shawwal P3D': {
          _name: '1 Shawwal'
        }
      },
      states: {
        BIH: {
          name: 'Federation of Bosnia and Herzegovina',
          days: {
            '03-01': {
              _name: 'Independence Day'
            },
            '11-25': {
              name: {
                en: 'Statehood Day',
                bs: 'Dan državnosti'
              }
            }
          },
          regions: {
            W: {
              name: 'Western Herzegovina',
              days: {
                '11-25': false
              }
            }
          }
        },
        BRC: {
          name: 'Brčko District',
          days: {
            '03-08': {
              name: {
                en: 'Day of the Establishment of the District'
              }
            }
          }
        },
        SRP: {
          name: 'Republika Srpska',
          days: {
            '01-09': {
              name: {
                en: 'Republic Day',
                bs: 'Dan Republike'
              }
            },
            '05-09': {
              name: {
                en: 'Victory Day',
                bs: 'Dan pobjede'
              }
            },
            '11-21': {
              name: {
                en: 'Dayton Agreement Day',
                bs: 'Dan uspostave Opšteg okvirnog sporazuma za mir u Bosni i Hercegovini'
              }
            }
          }
        }
      }
    },
    BB: {
      names: {
        en: 'Barbados'
      },
      dayoff: 'sunday',
      langs: [
        'en'
      ],
      zones: [
        'America/Barbados'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-21': {
          name: {
            en: 'Errol Barrow Day'
          }
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '04-28': {
          name: {
            en: 'National Heroes Day'
          }
        },
        '05-01 if sunday then next monday': {
          name: {
            en: 'May Day'
          }
        },
        'easter 49': {
          _name: 'easter 49'
        },
        'easter 50': {
          _name: 'easter 50'
        },
        '08-01': {
          name: {
            en: 'Emancipation Day'
          }
        },
        '1st monday in August': {
          name: {
            en: 'Kadooment Day'
          }
        },
        '11-30': {
          _name: 'Independence Day'
        },
        '12-25': {
          _name: '12-25'
        },
        'substitutes 12-25 if sunday then next tuesday': {
          _name: 'Public Holiday'
        },
        '12-26': {
          _name: '12-26'
        },
        'substitutes 12-26 if sunday then next monday': {
          _name: 'Public Holiday'
        }
      }
    },
    BD: {
      names: {
        bn: 'গণপ্রজাতন্ত্রী বাংলাদেশ',
        en: "People's Republic of Bangladesh"
      },
      langs: [
        'bn'
      ],
      zones: [
        'Asia/Dhaka'
      ],
      dayoff: 'friday',
      weekend: [
        'friday',
        'saturday'
      ],
      days: {
        'bengali-revised 11-9': {
          name: {
            bn: 'শহীদ দিবস',
            en: "Language Martyrs' Day"
          }
        },
        'bengali-revised 12-3': {
          name: {
            bn: 'মুজিব জয়ন',
            en: "Mujib's Birthday & Children's Day"
          }
        },
        'bengali-revised 12-12': {
          name: {
            bn: 'স্বাধীনতা দিবস',
            en: 'Independence Day'
          }
        },
        'bengali-revised 1-1': {
          name: {
            bn: 'পহেলা বৈশাখ',
            en: "Bengali New Year's Day"
          }
        },
        'bengali-revised 1-18': {
          _name: '05-01',
          name: {
            bn: 'মে দিবস',
            en: 'May Day'
          }
        },
        'bengali-revised 4-31': {
          name: {
            bn: 'জাতীয় শোক দিবস',
            en: 'National Mourning Day'
          }
        },
        'bengali-revised 9-2': {
          name: {
            bn: 'বিজয় দিবস',
            en: 'Victory Day'
          }
        },
        '10 Muharram': {
          _name: '10 Muharram'
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal'
        },
        '1 Shawwal P3D': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah P3D': {
          _name: '10 Dhu al-Hijjah'
        },
        '05-19': {
          name: {
            bn: 'বুদ্ধ পূর্ণিমা',
            en: "Buddha's Birthday"
          },
          enable: [
            '2016-05-21',
            '2017-05-10',
            '2018-04-29',
            '2019-05-19',
            '2020-05-07'
          ],
          disable: [
            '2016-05-19',
            '2017-05-19',
            '2018-05-19',
            '2019-05-19',
            '2020-05-19'
          ]
        },
        '08-24': {
          name: {
            bn: 'জন্মাষ্টমী',
            en: 'Krishna Janmashtami'
          },
          enable: [
            '2016-08-25',
            '2017-08-14',
            '2018-09-02',
            '2019-08-24',
            '2020-08-11'
          ],
          disable: [
            '2016-08-24',
            '2017-08-24',
            '2018-08-24',
            '2019-08-24',
            '2020-08-24'
          ]
        },
        '10-08': {
          name: {
            bn: 'দুর্গা পূজা',
            en: 'Durga Puja'
          },
          enable: [
            '2016-10-11',
            '2017-09-30',
            '2018-10-19',
            '2019-10-08',
            '2020-10-25'
          ],
          disable: [
            '2016-10-08',
            '2017-10-08',
            '2018-10-08',
            '2019-10-08',
            '2020-10-08'
          ]
        },
        'bengali-revised 9-11': {
          _name: '12-25'
        },
        '03-25': {
          name: {
            en: 'Genocide Remembrance Day'
          },
          type: 'observance'
        },
        '11-21': {
          name: {
            en: 'Armed Forces Day'
          },
          type: 'observance'
        },
        '12-14': {
          name: {
            en: 'Martyred Intellectuals Day'
          },
          type: 'observance'
        }
      }
    },
    BE: {
      names: {
        fr: 'Belgique',
        nl: 'België',
        de: 'Belgien',
        en: 'Belgium'
      },
      dayoff: 'sunday',
      zones: [
        'Europe/Brussels'
      ],
      langs: [
        'fr',
        'nl',
        'de'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-06': {
          _name: '01-06',
          name: {
            de: 'Erscheinung des Herrn'
          },
          type: 'observance'
        },
        '02-14': {
          _name: '02-14',
          type: 'observance'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01'
        },
        '2nd sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        'easter 39': {
          _name: 'easter 39'
        },
        'easter 49': {
          _name: 'easter 49',
          type: 'observance'
        },
        'easter 50': {
          _name: 'easter 50'
        },
        '07-21': {
          _name: 'National Holiday'
        },
        '08-15': {
          _name: '08-15'
        },
        '11-01': {
          _name: '11-01'
        },
        '11-02': {
          _name: '11-02',
          type: 'observance'
        },
        '11-11': {
          name: {
            de: 'Waffenstillstand',
            fr: 'Armistice',
            nl: 'Wapenstilstand'
          }
        },
        '11-15': {
          name: {
            nl: 'Koningsdag',
            fr: 'Fête du Roi',
            de: 'Festtag des Königs'
          },
          type: 'observance'
        },
        '12-06': {
          _name: '12-06',
          type: 'observance'
        },
        '12-25': {
          _name: '12-25'
        }
      },
      states: {
        BRU: {
          name: 'Bruxelles',
          langs: [
            'fr',
            'nl'
          ],
          days: {
            '05-08': {
              name: {
                nl: 'Feest van de Iris',
                fr: "Fête de l'Iris"
              },
              type: 'observance'
            }
          }
        },
        DE: {
          name: 'Deutschsprachige Gemeinschaft',
          langs: [
            'de'
          ],
          days: {
            '11-15': {
              name: {
                de: 'Tag der Deutschsprachigen Gemeinschaft',
                fr: 'Jour de la Communauté Germanophone',
                nl: 'Feestdag van de Duitstalige Gemeenschap'
              },
              type: 'observance'
            }
          }
        },
        VLG: {
          name: 'Vlaamse Gemeenschap',
          langs: [
            'nl'
          ],
          days: {
            '07-11': {
              name: {
                de: 'Festtag der Wallonischen Region',
                fr: 'Fête de la Région wallonne',
                nl: 'Feestdag van de Vlaamse Gemeenschap'
              },
              type: 'observance'
            }
          }
        },
        WAL: {
          name: 'Communauté française',
          langs: [
            'fr'
          ],
          days: {
            '09-27': {
              name: {
                de: 'Tag der Französischsprachigen Gemeinschaft',
                fr: 'La fête de la communauté française',
                nl: 'Feestdag van de Franse Gemeenschap'
              },
              type: 'observance'
            }
          }
        }
      }
    },
    BF: {
      names: {
        fr: 'Burkina Faso',
        en: 'Burkina Faso'
      },
      langs: [
        'fr'
      ],
      zones: [
        'Africa/Abidjan'
      ],
      dayoff: '',
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-03': {
          name: {
            fr: 'Soulèvement populaire',
            en: "Anniversary of the 1966 Upper Voltan coup d'état"
          }
        },
        '03-08': {
          _name: '03-08'
        },
        easter: {
          _name: 'easter'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        'easter 39': {
          _name: 'easter 39'
        },
        'easter 49': {
          _name: 'easter 49'
        },
        '05-01': {
          _name: '05-01'
        },
        '08-05': {
          _name: 'Independence Day'
        },
        '08-15': {
          _name: '08-15'
        },
        '11-01': {
          _name: '11-01'
        },
        '12-11': {
          name: {
            fr: 'Fête nationale',
            en: 'Proclamation of the Republic'
          }
        },
        '12-25': {
          _name: '12-25'
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal'
        },
        '1 Shawwal': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah'
        }
      }
    },
    BG: {
      names: {
        bg: 'България',
        en: 'Bulgaria'
      },
      langs: [
        'bg'
      ],
      zones: [
        'Europe/Sofia'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '03-01': {
          name: {
            bg: 'Баба Марта',
            en: 'Granny March Day'
          },
          type: 'observance'
        },
        '03-03': {
          name: {
            bg: 'Ден на Освобождението на България от Османската Империя',
            en: 'Liberation Day'
          }
        },
        '03-08': {
          _name: '03-08',
          type: 'observance'
        },
        'orthodox -2': {
          _name: 'easter -2'
        },
        orthodox: {
          _name: 'easter'
        },
        'orthodox 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01'
        },
        '05-06': {
          name: {
            bg: 'Гергьовден',
            en: "St. George's Day"
          }
        },
        '05-07': {
          name: {
            bg: 'Ден на радиото и телевизията',
            en: 'Radio and Television Day'
          },
          type: 'observance'
        },
        '05-24': {
          name: {
            bg: 'Ден на азбуката, културата и просветата',
            en: 'Bulgarian Education and Culture, and Slavonic Literature Day'
          }
        },
        '09-06': {
          name: {
            bg: 'Ден на съединението',
            en: 'Unification Day'
          }
        },
        '09-22': {
          _name: 'Independence Day'
        },
        '11-01': {
          name: {
            bg: 'Ден на народните будители',
            en: "Revival Leaders' Day"
          },
          type: 'school'
        },
        '12-24': {
          _name: '12-24'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26',
          type: 'observance'
        }
      }
    },
    BH: {
      names: {
        ar: 'مملكة البحرين',
        en: 'Bahrain'
      },
      langs: [
        'ar'
      ],
      zones: [
        'Asia/Qatar'
      ],
      dayoff: '',
      days: {
        '01-01': {
          _name: '01-01'
        },
        '05-01': {
          _name: '05-01',
          name: {
            ar: 'يوم العمال'
          }
        },
        '12-16': {
          name: {
            ar: 'اليوم الوطني',
            en: 'National Day'
          }
        },
        '12-17': {
          name: {
            ar: 'يوم الجلوس',
            en: 'Accession Day'
          }
        },
        '1 Muharram': {
          _name: '1 Muharram'
        },
        '10 Muharram': {
          _name: '10 Muharram'
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal'
        },
        '1 Shawwal': {
          _name: '1 Shawwal'
        },
        '9 Dhu al-Hijjah': {
          _name: '9 Dhu al-Hijjah'
        },
        '10 Dhu al-Hijjah P3D': {
          _name: '10 Dhu al-Hijjah'
        }
      }
    },
    BI: {
      names: {
        rn: "Republika y'Uburundi",
        fr: 'République du Burundi',
        en: 'Burundi'
      },
      dayoff: 'sunday',
      langs: [
        'fr',
        'en'
      ],
      zones: [
        'Africa/Maputo'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '02-05': {
          name: {
            fr: "Jour de l'Unité",
            en: 'Unity Day'
          }
        },
        '04-06': {
          name: {
            fr: 'Jour de Ntaryamira',
            en: 'Ntaryamira Day'
          }
        },
        '05-01': {
          _name: '05-01'
        },
        'easter 39': {
          _name: 'easter 39'
        },
        '07-01': {
          _name: 'Independence Day'
        },
        '08-15': {
          _name: '08-15'
        },
        '10-13': {
          name: {
            fr: 'Jour de Rwagasore',
            en: 'Rwagasore Day'
          }
        },
        '10-21': {
          name: {
            fr: 'Jour de Ndadaye',
            en: 'Ndadaye Day'
          }
        },
        '11-01': {
          _name: '11-01'
        },
        '12-25': {
          _name: '12-25'
        },
        '1 Shawwal': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah'
        },
        '2015-07-24': {
          _name: 'Public Holiday',
          name: {
            fr: "Jour l'élection des Sénateurs"
          }
        }
      }
    },
    BJ: {
      names: {
        fr: 'République du Bénin',
        en: 'Benin'
      },
      langs: [
        'fr'
      ],
      zones: [
        'Africa/Lagos'
      ],
      dayoff: '',
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-10': {
          name: {
            fr: 'Fête du Vodoun'
          }
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        'easter 39': {
          _name: 'easter 39'
        },
        'easter 49': {
          _name: 'easter 49',
          type: 'observance'
        },
        'easter 50': {
          _name: 'easter 50'
        },
        '05-01': {
          _name: '05-01'
        },
        '08-01': {
          _name: 'Independence Day',
          name: {
            fr: 'Fête Nationale'
          }
        },
        '08-15': {
          _name: '08-15'
        },
        '11-01': {
          _name: '11-01'
        },
        '12-25': {
          _name: '12-25'
        },
        '1 Shawwal': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah'
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal'
        }
      }
    },
    BL: {
      names: {
        fr: 'St. Barthélemy',
        en: 'St. Barths'
      },
      langs: [
        'fr'
      ],
      zones: [
        'America/St_Barthelemy'
      ],
      _days: 'FR',
      days: {
        'easter -48': {
          _name: 'easter -48',
          type: 'observance'
        },
        'easter -47': {
          _name: 'easter -47',
          type: 'Observance'
        },
        'easter -46': {
          _name: 'easter -46',
          type: 'observance'
        },
        'easter -21': {
          name: {
            fr: 'Mi-Carême',
            en: 'Laetare Sunday'
          },
          type: 'observance'
        },
        'easter -2': {
          _name: 'easter -2',
          type: 'bank'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        '08-24': {
          name: {
            fr: 'Fête de Saint Barthélemy',
            en: 'Saint Barth'
          },
          type: 'observance'
        },
        '10-09': {
          _name: 'Abolition of Slavery'
        },
        '12-25': {
          _name: '12-25'
        }
      }
    },
    BM: {
      names: {
        en: 'Bermuda'
      },
      langs: [
        'en'
      ],
      zones: [
        'Atlantic/Bermuda'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        'substitutes 01-01 if saturday, sunday then next monday': {
          _name: '01-01',
          substitute: true,
          type: 'bank',
          note: 'Goverment offices close'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        'friday before 06-01': {
          name: {
            en: 'Bermuda Day'
          }
        },
        '3nd monday in June': {
          name: {
            en: 'National Heroes Day'
          }
        },
        'thursday before 08-04': {
          name: {
            en: 'Emancipation Day'
          }
        },
        'friday before 08-05': {
          name: {
            en: "Somers' Day"
          }
        },
        'monday after 09-01': {
          name: {
            en: 'Labour Day'
          }
        },
        '11-11': {
          name: {
            en: 'Remembrance Day'
          }
        },
        'substitutes 11-11 if saturday, sunday then next monday': {
          name: {
            en: 'Remembrance Day'
          },
          substitute: true,
          type: 'bank',
          note: 'Goverment offices close'
        },
        '12-25': {
          _name: '12-25'
        },
        'substitutes 12-25 if saturday then next monday if sunday then next tuesday': {
          _name: '12-25',
          substitute: true,
          type: 'bank',
          note: 'Goverment offices close'
        },
        '12-26': {
          _name: '12-26'
        },
        'substitutes 12-26 if saturday then next monday if sunday then next tuesday': {
          _name: '12-26',
          substitute: true,
          type: 'bank',
          note: 'Goverment offices close'
        }
      }
    },
    BN: {
      names: {
        ms: 'Negara Brunei Darussalam',
        en: 'Brunei'
      },
      langs: [
        'ms',
        'en'
      ],
      zones: [
        'Asia/Brunei'
      ],
      dayoff: '',
      days: {
        '01-01': {
          _name: '01-01',
          name: {
            ms: 'Awal Tahun Masihi'
          }
        },
        '02-23': {
          name: {
            en: 'National Day',
            ms: 'Hari Kebangsaan'
          }
        },
        '03-31': {
          name: {
            en: 'Armed Forces Day',
            ms: 'Hari Angkatan Bersenjata Diraja Brunei'
          }
        },
        '07-15': {
          name: {
            en: "Sultan's Birthday",
            ms: 'Hari Keputeraan KDYMM Sultan Brunei'
          }
        },
        '1 Ramadan': {
          _name: '1 Ramadan'
        },
        '17 Ramadan': {
          name: {
            en: 'Nuzul Al-Quran',
            ms: 'Hari Nuzul Al-Quran'
          }
        },
        '1 Shawwal P3D': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah'
        },
        '1 Muharram': {
          _name: '1 Muharram'
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal'
        },
        '27 Rajab': {
          _name: '27 Rajab'
        },
        '12-25': {
          _name: '12-25'
        },
        'chinese 01-0-01': {
          name: {
            en: 'Chinese New Year',
            ms: 'Tahun Baru Cina'
          }
        }
      }
    },
    BO: {
      names: {
        es: 'Bolivia',
        en: 'Bolivia'
      },
      dayoff: 'sunday',
      langs: [
        'es',
        'qu',
        'ay'
      ],
      zones: [
        'America/La_Paz'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '02-02': {
          name: {
            en: 'Feast of the Virgin of Candelaria',
            qu: 'Mamacha Candelaria',
            es: 'Fiesta de la Virgen de Candelaria'
          }
        },
        'easter -48': {
          name: {
            en: 'Carnival',
            es: 'Carnaval'
          }
        },
        'easter -47': {
          _name: 'easter -47'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 39': {
          _name: 'easter 39'
        },
        '06-21': {
          name: {
            en: 'Andean New Year',
            ay: 'Willkakuti',
            es: 'Año Nuevo Andino'
          }
        },
        '08-02': {
          name: {
            en: 'Agrarian Reform Day',
            es: 'Día de la Revolución Agraria, Productiva y Comunitaria'
          }
        },
        '08-06': {
          _name: 'Independence Day',
          name: {
            es: 'Día de la Patria'
          }
        },
        '11-02': {
          _name: '11-02'
        },
        '12-25': {
          _name: '12-25'
        }
      }
    },
    BQ: {
      names: {
        nl: 'Caribisch Nederland',
        en: 'Caribbean Netherlands'
      },
      dayoff: 'sunday',
      zones: [
        'America/Curacao'
      ],
      langs: [
        'nl',
        'en',
        'pap'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '04-27': {
          name: {
            pap: 'Aña di Rey',
            nl: 'Koningsdag',
            en: 'Kings Day'
          }
        },
        '05-01 if sunday then next monday': {
          substitute: true,
          _name: '05-01'
        },
        '2nd sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        '3rd sunday in June': {
          _name: 'Fathers Day',
          type: 'observance'
        },
        'easter 39': {
          _name: 'easter 39'
        },
        '12-05': {
          name: {
            nl: 'Sinterklaasavond',
            en: "St. Nicholas' Eve"
          },
          type: 'observance'
        },
        '12-15': {
          name: {
            pap: 'Dia di Reino',
            nl: 'Koninkrijksdag',
            en: 'Kingdom Day'
          }
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        }
      },
      regions: {
        BO: {
          name: 'Bonaire',
          days: {
            'easter -48': {
              _name: 'easter -48',
              name: {
                en: 'Carnival Monday'
              }
            },
            '04-30': {
              name: {
                en: 'Rincon Day',
                pap: 'Dia di Rincon'
              }
            },
            '09-06': {
              name: {
                nl: 'Boneiru Dag',
                en: 'Bonaire Day',
                pap: 'Dia di Boneiru'
              }
            }
          }
        },
        SA: {
          name: 'Saba',
          days: {
            '1st monday in August': {
              _name: 'easter -48',
              name: {
                en: 'Carnival Monday'
              }
            },
            '1st friday in December': {
              name: {
                en: 'Saba Day'
              }
            }
          }
        },
        SE: {
          name: 'Sint Eustatius',
          days: {
            '08-01': {
              name: {
                en: 'Emancipation Day'
              }
            },
            '11-16': {
              name: {
                en: 'Statia Day'
              }
            }
          }
        }
      }
    },
    BR: {
      names: {
        pt: 'Brasil',
        en: 'Brazil'
      },
      dayoff: 'sunday',
      langs: [
        'pt'
      ],
      zones: [
        'America/Sao_Paulo',
        'America/Noronha',
        'America/Belem',
        'America/Fortaleza',
        'America/Recife',
        'America/Araguaina',
        'America/Maceio',
        'America/Bahia',
        'America/Campo_Grande',
        'America/Cuiaba',
        'America/Santarem',
        'America/Porto_Velho',
        'America/Boa_Vista',
        'America/Manaus',
        'America/Eirunepe',
        'America/Rio_Branco'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '04-21': {
          name: {
            pt: 'Dia de Tiradentes',
            en: "Tiradentes' Day"
          }
        },
        'easter -50 PT110H': {
          name: {
            pt: 'Carnaval',
            en: 'Carnival'
          },
          type: 'optional'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        '05-01': {
          _name: '05-01'
        },
        '2nd sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        'easter 60': {
          _name: 'easter 60',
          type: 'optional'
        },
        '06-12': {
          name: {
            pt: 'Dia dos Namorados',
            en: "Lovers' Day"
          },
          type: 'observance'
        },
        '2nd sunday in August': {
          _name: 'Fathers Day',
          type: 'observance'
        },
        '09-07': {
          _name: 'Independence Day'
        },
        '10-12': {
          name: {
            pt: 'Nossa Senhora Aparecida',
            en: 'Our Lady of Aparecida'
          }
        },
        '1st sunday in October in even years': {
          name: {
            pt: 'Dia de Eleição',
            en: 'Election Day'
          }
        },
        '1st sunday before 11-01 in even years': {
          name: {
            pt: 'Dia de Eleição',
            en: 'Election Day'
          }
        },
        '11-02': {
          _name: '11-02'
        },
        '11-15': {
          name: {
            pt: 'Proclamação da República',
            en: 'Republic Day'
          }
        },
        '12-24 14:00': {
          _name: '12-24',
          type: 'optional'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-31 14:00': {
          _name: '12-31',
          type: 'optional'
        }
      },
      states: {
        AC: {
          name: 'Acre',
          zones: [
            'America/Rio_Branco'
          ],
          days: {
            '01-12': {
              name: {
                pt: 'Dia do evangélico'
              },
              active: [
                {
                  from: '2004-01-29T00:00:00.000Z'
                }
              ]
            },
            '03-08': {
              name: {
                pt: 'Alusivo ao Dia Internacional da Mulher'
              },
              active: [
                {
                  from: '2001-09-14T00:00:00.000Z'
                }
              ]
            },
            '06-15': {
              name: {
                pt: 'Aniversário do estado'
              },
              active: [
                {
                  from: '1964-09-02T00:00:00.000Z'
                }
              ]
            },
            '09-05': {
              name: {
                pt: 'Dia da Amazônia'
              },
              active: [
                {
                  from: '2004-01-05T00:00:00.000Z'
                }
              ]
            },
            '11-17': {
              name: {
                pt: 'Assinatura do Tratado de Petrópolis'
              },
              type: 'optional',
              active: [
                {
                  from: '2012-02-21T00:00:00.000Z'
                }
              ]
            }
          }
        },
        AL: {
          name: 'Alagoas',
          zones: [
            'America/Maceio'
          ],
          days: {
            '06-24': {
              name: {
                pt: 'São João'
              },
              active: [
                {
                  from: '1993-07-07T00:00:00.000Z'
                }
              ]
            },
            '06-29': {
              name: {
                pt: 'São Pedro'
              },
              active: [
                {
                  from: '1993-07-07T00:00:00.000Z'
                }
              ]
            },
            '09-16': {
              name: {
                pt: 'Emancipação política'
              }
            },
            '11-20': {
              name: {
                pt: 'Morte de Zumbi dos Palmares'
              },
              active: [
                {
                  from: '1995-08-01T00:00:00.000Z'
                }
              ]
            }
          }
        },
        AM: {
          name: 'Amazonas',
          zones: [
            'America/Manaus'
          ],
          days: {
            '09-05': {
              name: {
                pt: 'Elevação do Amazonas à categoria de província'
              },
              active: [
                {
                  from: '1977-12-21T00:00:00.000Z'
                }
              ]
            },
            '11-20': {
              name: {
                pt: 'Dia da Consciência Negra'
              },
              active: [
                {
                  from: '2010-07-08T00:00:00.000Z'
                }
              ]
            }
          }
        },
        AP: {
          name: 'Amapá',
          zones: [
            'America/Belem'
          ],
          days: {
            '03-19': {
              name: {
                pt: 'Dia de São José'
              },
              note: 'Santo padroeiro do Estado do Amapá',
              active: [
                {
                  from: '2002-04-16T00:00:00.000Z'
                }
              ]
            },
            '09-13': {
              name: {
                pt: 'Criação do Território Federal'
              }
            }
          }
        },
        BA: {
          name: 'Bahia',
          zones: [
            'America/Bahia'
          ],
          days: {
            '07-02': {
              name: {
                pt: 'Independência da Bahia'
              }
            }
          }
        },
        CE: {
          name: 'Ceará',
          zones: [
            'America/Fortaleza'
          ],
          days: {
            '03-25': {
              name: {
                pt: 'Data magna do estado'
              },
              active: [
                {
                  from: '2011-12-01T00:00:00.000Z'
                }
              ]
            }
          }
        },
        DF: {
          name: 'Distrito Federal',
          zones: [
            'America/Sao_Paulo'
          ],
          days: {
            '04-21': {
              name: {
                pt: 'Fundação de Brasília'
              }
            },
            '11-30': {
              name: {
                pt: 'Dia do Evangélico'
              },
              type: 'public',
              active: [
                {
                  from: '1995-12-04T00:00:00.000Z'
                }
              ]
            }
          }
        },
        MA: {
          name: 'Maranhão',
          zones: [
            'America/Belem'
          ],
          days: {
            '07-28': {
              name: {
                pt: 'Adesão do Maranhão à independência do Brasil'
              },
              active: [
                {
                  from: '1964-10-02T00:00:00.000Z'
                }
              ]
            }
          }
        },
        MG: {
          name: 'Minas Gerais',
          zones: [
            'America/Sao_Paulo'
          ],
          days: {
            '04-21': {
              name: {
                pt: 'Data magna do estado'
              }
            }
          },
          regions: {
            BH: {
              name: 'Belo Horizonte',
              days: {
                '08-15': {
                  _name: '08-15',
                  name: {
                    pt: 'Assunção de Nossa Senhora'
                  },
                  type: 'public'
                },
                '12-08': {
                  _name: '12-08',
                  type: 'public'
                }
              }
            }
          }
        },
        MS: {
          name: 'Mato Grosso do Sul',
          zones: [
            'America/Campo_Grande'
          ],
          days: {
            '10-11': {
              name: {
                pt: 'Criação do estado'
              },
              active: [
                {
                  from: '1979-10-29T00:00:00.000Z'
                }
              ]
            }
          }
        },
        MT: {
          name: 'Mato Grosso',
          zones: [
            'America/Cuiaba'
          ],
          days: {
            '11-20': {
              name: {
                pt: 'Dia da Consciência Negra'
              },
              active: [
                {
                  from: '2002-12-27T00:00:00.000Z'
                }
              ]
            }
          }
        },
        PA: {
          name: 'Pará',
          zones: [
            'America/Santarem'
          ],
          days: {
            '08-15': {
              name: {
                pt: 'Adesão do Grão-Pará à independência do Brasil'
              },
              active: [
                {
                  from: '1996-09-10T00:00:00.000Z'
                }
              ]
            }
          }
        },
        PB: {
          name: 'Paraíba',
          zones: [
            'America/Recife'
          ],
          days: {
            '07-26': {
              name: {
                pt: 'Homenagem à memória do ex-presidente João Pessoa'
              }
            },
            '08-05': {
              name: {
                pt: 'Nossa Senhora das Neves'
              },
              note: 'Fundação do Estado em 1585 e dia da sua padroeira',
              active: [
                {
                  from: '1967-08-30T00:00:00.000Z'
                }
              ]
            }
          }
        },
        PE: {
          name: 'Pernambuco',
          zones: [
            'America/Recife'
          ],
          days: {
            '1st sunday in March': {
              name: {
                pt: 'Revolução Pernambucana de 1817'
              },
              active: [
                {
                  from: '2009-07-02T00:00:00.000Z'
                }
              ]
            }
          },
          regions: {
            RE: {
              name: 'Recife',
              days: {
                '06-24': {
                  name: {
                    pt: 'São João',
                    en: "Saint John's Day"
                  },
                  type: 'public'
                },
                '07-16': {
                  name: {
                    pt: 'Nossa Senhora do Carmo'
                  },
                  type: 'public'
                },
                '12-08': {
                  _name: '12-08',
                  name: {
                    pt: 'Nossa Senhora da Conceição'
                  },
                  type: 'public'
                }
              }
            }
          }
        },
        PI: {
          name: 'Piauí',
          zones: [
            'America/Fortaleza'
          ],
          days: {
            '10-19': {
              name: {
                pt: 'Dia do Piauí'
              },
              active: [
                {
                  from: '1937-01-01T00:00:00.000Z'
                }
              ]
            }
          }
        },
        PR: {
          name: 'Paraná',
          zones: [
            'America/Sao_Paulo'
          ],
          days: {
            '12-19': {
              name: {
                pt: 'Emancipação política do estado do Paraná'
              },
              active: [
                {
                  from: '1962-12-18T00:00:00.000Z'
                }
              ]
            }
          },
          regions: {
            CU: {
              name: 'Curitiba',
              days: {
                '09-08': {
                  name: {
                    pt: 'Nossa Senhora da Luz dos Pinhais'
                  },
                  type: 'public'
                }
              }
            }
          }
        },
        RJ: {
          name: 'Rio de Janeiro',
          zones: [
            'America/Sao_Paulo'
          ],
          days: {
            'easter -47': {
              name: {
                pt: 'Carnaval'
              },
              active: [
                {
                  from: '2008-05-14T00:00:00.000Z'
                }
              ]
            },
            '04-23': {
              name: {
                pt: 'Dia de São Jorge'
              },
              active: [
                {
                  from: '2008-03-05T00:00:00.000Z'
                }
              ]
            },
            '3rd tuesday in October': {
              name: {
                pt: 'Dia do Comércio'
              },
              type: 'observance',
              note: 'feriado para os comerciantes e trabalhadores da construção civil'
            },
            '11-20': {
              name: {
                pt: 'Dia da Consciência Negra'
              },
              active: [
                {
                  from: '2002-11-11T00:00:00.000Z'
                }
              ]
            }
          }
        },
        RN: {
          name: 'Rio Grande do Norte',
          zones: [
            'America/Recife'
          ],
          days: {
            '10-03': {
              name: {
                pt: 'Mártires de Cunhaú e Uruaçu'
              },
              active: [
                {
                  from: '2006-12-06T00:00:00.000Z'
                }
              ]
            }
          }
        },
        RO: {
          name: 'Rondônia',
          zones: [
            'America/Porto_Velho'
          ],
          days: {
            '01-04': {
              name: {
                pt: 'Criação do estado'
              },
              active: [
                {
                  from: '2010-04-22T00:00:00.000Z'
                }
              ]
            },
            '06-18': {
              name: {
                pt: 'Dia do evangélico'
              },
              active: [
                {
                  from: '2001-12-20T00:00:00.000Z'
                }
              ]
            }
          }
        },
        RR: {
          name: 'Roraima',
          zones: [
            'America/Boa_Vista'
          ],
          days: {
            '10-05': {
              name: {
                pt: 'Criação do estado'
              }
            }
          }
        },
        RS: {
          name: 'Rio Grande do Sul',
          zones: [
            'America/Sao_Paulo'
          ],
          days: {
            '09-20': {
              name: {
                pt: 'Proclamação da República Rio-Grandense'
              }
            }
          }
        },
        SC: {
          name: 'Santa Catarina',
          zones: [
            'America/Sao_Paulo'
          ],
          days: {
            '08-11': {
              name: {
                pt: 'Dia de Santa Catarina'
              },
              active: [
                {
                  from: '2004-01-22T00:00:00.000Z',
                  to: '2005-07-15T00:00:00.000Z'
                }
              ]
            },
            '08-11 if monday,tuesday,wednesday,thursday,friday,saturday then next sunday': {
              name: {
                pt: 'Dia de Santa Catarina'
              },
              active: [
                {
                  from: '2005-07-15T00:00:00.000Z'
                }
              ]
            },
            '11-25': {
              name: {
                pt: 'Dia de Santa Catarina de Alexandria'
              },
              active: [
                {
                  from: '1996-12-26T00:00:00.000Z',
                  to: '2005-07-15T00:00:00.000Z'
                }
              ]
            },
            '11-25 if monday,tuesday,wednesday,thursday,friday,saturday then next sunday': {
              name: {
                pt: 'Dia de Santa Catarina de Alexandria'
              },
              active: [
                {
                  from: '2005-07-15T00:00:00.000Z'
                }
              ]
            }
          }
        },
        SE: {
          name: 'Sergipe',
          zones: [
            'America/Recife'
          ],
          days: {
            '07-08': {
              name: {
                pt: 'Emancipação política de Sergipe'
              }
            }
          }
        },
        SP: {
          name: 'São Paulo',
          zones: [
            'America/Sao_Paulo'
          ],
          days: {
            '07-09': {
              name: {
                pt: 'Revolução Constitucionalista'
              },
              active: [
                {
                  from: '1997-03-05T00:00:00.000Z'
                }
              ]
            }
          },
          regions: {
            SP: {
              name: 'São Paulo',
              days: {
                '01-25': {
                  name: {
                    pt: 'Aniversário da Cidade',
                    en: 'City Birthday'
                  },
                  type: 'public'
                }
              }
            }
          }
        },
        TO: {
          name: 'Tocantins',
          zones: [
            'America/Araguaina'
          ],
          days: {
            '10-05': {
              name: {
                pt: 'Criação do estado'
              },
              active: [
                {
                  from: '1989-11-17T00:00:00.000Z'
                }
              ]
            },
            '03-18': {
              name: {
                pt: 'Autonomia do Estado'
              },
              active: [
                {
                  from: '1998-03-17T00:00:00.000Z'
                }
              ]
            },
            '09-08': {
              name: {
                pt: 'Nossa Senhora da Natividade'
              },
              note: 'Padroeira do Estado',
              active: [
                {
                  from: '1993-12-28T00:00:00.000Z'
                }
              ]
            }
          }
        }
      }
    },
    BS: {
      names: {
        en: 'Bahamas'
      },
      dayoff: 'sunday',
      langs: [
        'en'
      ],
      zones: [
        'America/Nassau'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-10 and if saturday,sunday then next monday': {
          substitute: true,
          name: {
            en: 'Majority Rule Day'
          }
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '2nd sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        'easter 49': {
          _name: 'easter 49',
          type: 'observance'
        },
        'easter 50': {
          _name: 'easter 50'
        },
        '1st friday in June': {
          _name: '05-01',
          name: {
            en: 'Randol Fawkes Labour Day'
          }
        },
        '07-10 and if saturday,sunday then next monday': {
          substitute: true,
          _name: 'Independence Day'
        },
        '1st monday in August': {
          name: {
            en: 'Emancipation Day'
          }
        },
        '10-12 and if saturday,sunday then next monday': {
          substitute: true,
          name: {
            en: "National Heroes' Day"
          }
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        }
      }
    },
    BW: {
      names: {
        en: 'Botswana'
      },
      dayoff: 'sunday',
      langs: [
        'en'
      ],
      zones: [
        'Africa/Maputo'
      ],
      days: {
        '01-01': {
          _name: '01-01',
          note: 'except mining industy'
        },
        '01-02': {
          name: {
            en: "New Year's Holiday"
          },
          note: 'except mining industy'
        },
        'substitutes 01-02 if monday then next tuesday': {
          name: {
            en: 'Public Holiday'
          },
          note: 'except mining industy'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        'easter -1': {
          _name: 'easter -1',
          note: 'except mining industy'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1',
          note: 'except mining industy'
        },
        'easter 39': {
          _name: 'easter 39',
          note: 'except mining industy'
        },
        '05-01': {
          _name: '05-01',
          note: 'except mining industy'
        },
        'substitutes 05-01 if sunday then next monday': {
          name: {
            en: 'Public Holiday'
          },
          note: 'except mining industy'
        },
        '2nd sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        '07-01': {
          name: {
            en: 'Sir Seretse Khama Day'
          },
          note: 'except mining industy'
        },
        'substitutes 07-01 if sunday then next monday': {
          name: {
            en: 'Public Holiday'
          },
          note: 'except mining industy'
        },
        '3rd monday in July': {
          name: {
            en: 'President’s Day'
          },
          note: 'except mining industy'
        },
        'tuesday after 3rd monday in July': {
          name: {
            en: 'President’s Day Holiday'
          },
          note: 'except mining industy'
        },
        '09-30': {
          name: {
            en: 'Botswana Day'
          }
        },
        'substitutes 09-30 if saturday,sunday then next monday': {
          name: {
            en: 'Public Holiday'
          }
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26',
          name: {
            en: 'Family Day'
          },
          note: 'except mining industy'
        },
        'substitutes 12-26 if monday then next tuesday': {
          name: {
            en: 'Public Holiday'
          }
        }
      }
    },
    BY: {
      names: {
        be: 'Рэспубліка Беларусь',
        ru: 'Республика Беларусь',
        en: 'Belarus'
      },
      zones: [
        'Europe/Minsk'
      ],
      langs: [
        'be',
        'ru'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        'julian 12-25': {
          _name: '12-25',
          name: {
            be: 'Каляды праваслаўныя'
          }
        },
        easter: {
          _name: 'easter',
          name: {
            be: 'Вялiкдзень каталiцкi'
          },
          type: 'observance'
        },
        orthodox: {
          name: {
            en: 'Orthodox Easter',
            be: 'Вялiкдзень праваслаўны'
          },
          type: 'observance'
        },
        'orthodox +9': {
          name: {
            en: 'Commemoration Day',
            be: 'Радунiца'
          }
        },
        '03-08': {
          _name: '03-08'
        },
        '05-01': {
          _name: '05-01'
        },
        '05-09': {
          name: {
            en: 'Victory Day',
            be: 'Дзень Перамогi'
          }
        },
        '07-03': {
          _name: 'Independence Day',
          active: [
            {
              from: 1996
            }
          ]
        },
        '11-07': {
          name: {
            en: 'October Revolution Day',
            be: 'Дзень Кастрычніцкай рэвалюцыі'
          }
        },
        '12-25': {
          _name: '12-25',
          name: {
            be: 'Каляды каталiцкiя'
          }
        }
      }
    },
    BZ: {
      names: {
        en: 'Belize'
      },
      dayoff: 'sunday',
      langs: [
        'en'
      ],
      zones: [
        'America/Belize'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '03-09 if friday,saturday,sunday then next monday if tuesday,wednesday,thursday then previous monday': {
          name: {
            en: 'Baron Bliss Day'
          }
        },
        'easter -2': {
          _name: 'easter -2'
        },
        'easter -1': {
          _name: 'easter -1'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01 if sunday then next monday': {
          _name: '05-01'
        },
        '05-24 if friday,saturday,sunday then next monday if tuesday,wednesday,thursday then previous monday': {
          name: {
            en: "Commonwealth Day, Sovereign's Day"
          }
        },
        '09-10 if sunday then next monday': {
          name: {
            en: "Saint George's Caye Day, National Day"
          }
        },
        '09-21 if sunday then next monday': {
          _name: 'Independence Day'
        },
        '10-12 if friday,saturday,sunday then next monday if tuesday,wednesday,thursday then previous monday': {
          name: {
            en: 'Day of the Americas'
          }
        },
        '11-19 if sunday then next monday': {
          name: {
            en: 'Garifuna Settlement Day'
          }
        },
        '12-25 and if sunday then next tuesday': {
          _name: '12-25',
          substitute: true
        },
        '12-26 and if sunday then next monday': {
          _name: '12-26',
          substitute: true
        }
      }
    },
    CA: {
      names: {
        en: 'Canada',
        fr: 'Canada'
      },
      zones: [
        'America/Toronto',
        'America/St_Johns',
        'America/Halifax',
        'America/Glace_Bay',
        'America/Moncton',
        'America/Goose_Bay',
        'America/Blanc-Sablon',
        'America/Nipigon',
        'America/Thunder_Bay',
        'America/Iqaluit',
        'America/Pangnirtung',
        'America/Resolute',
        'America/Atikokan',
        'America/Rankin_Inlet',
        'America/Winnipeg',
        'America/Rainy_River',
        'America/Regina',
        'America/Swift_Current',
        'America/Edmonton',
        'America/Cambridge_Bay',
        'America/Yellowknife',
        'America/Inuvik',
        'America/Creston',
        'America/Dawson_Creek',
        'America/Fort_Nelson',
        'America/Vancouver',
        'America/Whitehorse',
        'America/Dawson'
      ],
      langs: [
        'en',
        'fr'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '02-02': {
          name: {
            en: 'Groundhog Day',
            fr: 'Jour de la marmotte'
          },
          type: 'observance'
        },
        '02-14': {
          _name: '02-14',
          type: 'observance'
        },
        '03-17': {
          name: {
            en: 'St. Patrick’s Day',
            fr: 'Fête de la Saint-Patrick'
          },
          type: 'observance'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter'
        },
        '2nd sunday after 05-01': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        'monday before 05-25': {
          name: {
            en: 'Victoria Day',
            fr: 'Fête de la Reine'
          }
        },
        '3rd sunday after 06-01': {
          _name: 'Fathers Day',
          type: 'observance'
        },
        '07-01': {
          name: {
            en: 'Canada Day',
            fr: 'Fête du Canada'
          }
        },
        'monday after 08-01': {
          name: {
            en: 'Civic Holiday',
            fr: 'Premier lundi d’août'
          }
        },
        '1st monday in September': {
          _name: '05-01'
        },
        '09-30 since 2021': {
          name: {
            en: 'National Day for Truth and Reconciliation',
            fr: 'Journée nationale de la vérité et de la réconciliation'
          }
        },
        '2nd monday after 10-01': {
          name: {
            en: 'Thanksgiving',
            fr: 'Action de grâce'
          }
        },
        '10-31 18:00': {
          name: {
            en: 'Halloween',
            fr: "l'Halloween"
          },
          type: 'observance'
        },
        '11-11': {
          name: {
            en: 'Remembrance Day',
            fr: 'Jour du Souvenir'
          }
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        }
      },
      states: {
        AB: {
          name: 'Alberta',
          zones: [
            'America/Edmonton'
          ],
          days: {
            '3rd monday after 02-01': {
              name: {
                en: 'Family Day',
                fr: 'Fête de la famille'
              }
            },
            'easter 1': {
              _name: 'easter 1',
              type: 'optional'
            },
            'monday after 08-01': {
              name: {
                en: 'Heritage Day',
                fr: 'Fête du patrimoine'
              },
              type: 'optional'
            }
          }
        },
        BC: {
          name: 'British Columbia',
          zones: [
            'America/Vancouver',
            'America/Edmonton',
            'America/Creston',
            'America/Dawson_Creek'
          ],
          days: {
            '2nd monday after 02-01': {
              name: {
                en: 'Family Day',
                fr: 'Fête de la famille'
              },
              active: [
                {
                  to: 2019
                }
              ]
            },
            '3rd monday after 02-01': {
              name: {
                en: 'Family Day',
                fr: 'Fête de la famille'
              },
              active: [
                {
                  from: 2019
                }
              ]
            }
          }
        },
        MB: {
          name: 'Manitoba',
          zones: [
            'America/Winnipeg'
          ],
          days: {
            '3rd monday after 02-01': {
              name: {
                en: 'Louis Riel Day',
                fr: 'Journée Louis Riel'
              }
            }
          }
        },
        NB: {
          name: 'New Brunswick',
          zones: [
            'America/Moncton'
          ],
          days: {
            'monday after 08-01': {
              name: {
                en: 'New Brunswick Day',
                fr: 'Jour de Nouveau Brunswick'
              }
            }
          }
        },
        NL: {
          name: 'Newfoundland and Labrador',
          zones: [
            'America/St_Johns',
            'America/Goose_Bay'
          ],
          days: {
            '03-17': {
              name: {
                en: "Saint Patrick's Day",
                fr: 'Jour de la Saint-Patrick'
              },
              type: 'optional'
            },
            '04-23': {
              name: {
                en: "Saint George's Day",
                fr: 'Jour de St. George'
              },
              type: 'optional'
            },
            '06-24': {
              name: {
                en: 'Discovery Day',
                fr: 'Journée découverte'
              },
              type: 'optional'
            },
            '07-12': {
              name: {
                en: "Orangemen's Day",
                fr: 'Fête des orangistes'
              },
              type: 'optional'
            },
            '11-11': {
              name: {
                en: 'Armistice Day',
                fr: "Jour de l'Armistice"
              }
            }
          }
        },
        NS: {
          name: 'Nova Scotia',
          zones: [
            'America/Halifax',
            'America/Moncton'
          ],
          days: {
            '3rd monday after 02-01': {
              name: {
                en: 'Heritage Day',
                fr: 'Fête du Patrimoine'
              }
            },
            'monday after 08-01': {
              name: {
                en: 'Natal Day',
                fr: 'Jour de la Fondation'
              }
            }
          }
        },
        NT: {
          name: 'Northwest Territories',
          zones: [
            'America/Yellowknife',
            'America/Inuvik'
          ],
          days: {
            '06-21': {
              name: {
                en: 'National Aboriginal Day',
                fr: 'Journée nationale des Autochthones'
              }
            }
          }
        },
        NU: {
          name: 'Nunavut',
          zones: [
            'America/Iqaluit',
            'America/Pangnirtung',
            'America/Resolute',
            'America/Rankin_Inlet',
            'America/Atikokan',
            'America/Cambridge_Bay'
          ],
          days: {
            '07-09': {
              name: {
                en: 'Nunavut Day'
              },
              type: 'bank'
            }
          }
        },
        ON: {
          name: 'Ontario',
          zones: [
            'America/Toronto',
            'America/Nipigon',
            'America/Thunder_Bay',
            'America/Atikokan',
            'America/Rainy_River',
            'America/Winnipeg'
          ],
          days: {
            '3rd monday after 02-01': {
              name: {
                en: 'Family Day',
                fr: 'Fête de la famille'
              }
            },
            'easter 1': {
              _name: 'easter 1'
            }
          }
        },
        PE: {
          name: 'Prince Edward Island',
          days: {
            '3rd monday after 02-01': {
              name: {
                en: 'Islander Day',
                fr: 'Fête des Insulaires'
              }
            },
            'easter 1': {
              _name: 'easter 1',
              type: 'optional'
            },
            '3rd friday after 08-01': {
              name: {
                en: 'Gold Cup Parade Day',
                fr: "Défilé de la Coupe d'or"
              }
            }
          }
        },
        QC: {
          name: 'Quebec',
          zones: [
            'America/Blanc-Sablon',
            'America/Toronto',
            'America/Nipigon'
          ],
          days: {
            'easter -2': {
              _name: 'easter -2',
              note: 'Either Good Friday or Easter Monday, at the employer’s option'
            },
            'easter 1': {
              _name: 'easter 1',
              note: 'Either Good Friday or Easter Monday, at the employer’s option'
            },
            'monday before 05-25': {
              name: {
                en: "National Patriots' Day",
                fr: 'Journée nationale des patriotes'
              }
            },
            '06-24': {
              name: {
                en: 'National Holiday',
                fr: 'Fête nationale du Québec'
              }
            },
            'monday after 08-01': false
          }
        },
        SK: {
          name: 'Saskatchewan',
          zones: [
            'America/Regina',
            'America/Swift_Current',
            'America/Edmonton'
          ],
          days: {
            '3rd monday after 02-01': {
              name: {
                en: 'Family Day',
                fr: 'Fête de la famille'
              }
            },
            '3rd monday after 08-01': {
              name: {
                en: 'Saskatchewan Day'
              }
            }
          }
        },
        YT: {
          name: 'Yukon',
          zones: [
            'America/Whitehorse',
            'America/Dawson'
          ],
          days: {
            'easter 1': {
              _name: 'easter 1'
            },
            '3rd monday after 08-01': {
              name: {
                en: 'Discovery Day',
                fr: 'Jour de la Découverte'
              }
            }
          }
        }
      }
    },
    CC: {
      names: {
        en: 'Cocos (Keeling) Islands'
      },
      langs: [
        'en'
      ],
      zones: [
        'Indian/Cocos'
      ],
      dayoff: 'sunday',
      days: {
        'chinese 01-0-01 and if sunday then next tuesday if saturday then next monday': {
          name: {
            en: 'Chinese New Year'
          },
          substitute: true
        },
        'chinese 01-0-02 and if sunday then next tuesday if saturday then next monday': {
          name: {
            en: 'Chinese New Year (2nd Day)'
          },
          substitute: true
        },
        '01-01': {
          _name: '01-01'
        },
        '01-26': {
          name: {
            en: 'Australia Day'
          }
        },
        '03-20': {
          name: {
            en: 'Labour Day'
          }
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '04-06': {
          name: {
            en: 'Self Determination Day'
          }
        },
        '04-25': {
          name: {
            en: 'Anzac Day'
          }
        },
        '12-25 and if sunday then next tuesday': {
          _name: '12-25',
          substitute: true
        },
        '12-26 and if sunday then next monday': {
          _name: '12-26',
          substitute: true
        },
        '1 Muharram and if sunday then next monday': {
          substitute: true,
          _name: '1 Muharram'
        },
        '1 Shawwal and if sunday then next monday': {
          substitute: true,
          _name: '1 Shawwal',
          name: {
            en: 'Hari Raya Puasa'
          }
        },
        '10 Dhu al-Hijjah and if sunday then next monday': {
          substitute: true,
          _name: '10 Dhu al-Hijjah',
          name: {
            en: 'Hari Raya Haji'
          }
        },
        '12 Rabi al-awwal and if sunday then next monday': {
          substitute: true,
          _name: '12 Rabi al-awwal',
          name: {
            en: 'Hari Maulaud Nabi'
          }
        }
      }
    },
    CD: {
      names: {
        fr: 'République démocratique du Congo',
        en: 'Democratic Republic of the Congo'
      },
      dayoff: 'sunday',
      langs: [
        'fr'
      ],
      zones: [
        'Africa/Maputo',
        'Africa/Lagos'
      ],
      days: {
        '01-01 and if sunday then next monday': {
          substitute: true,
          _name: '01-01'
        },
        '01-04 and if sunday then next monday': {
          substitute: true,
          name: {
            fr: "Martyrs de l'Indépendance",
            en: 'Day of the Martyrs'
          }
        },
        '01-16 and if sunday then next tuesday': {
          substitute: true,
          name: {
            fr: 'Journée du Héro National Laurent Désiré Kabila',
            en: 'Anniversary of President Laurent Kabila'
          }
        },
        '01-17 and if sunday then next monday': {
          substitute: true,
          name: {
            fr: 'Journée du Héro National Patrice Emery Lumumba',
            en: 'Anniversary of Prime Minister Patrice Emery Lumumba'
          }
        },
        '05-01 and if sunday then next monday': {
          substitute: true,
          _name: '05-01'
        },
        '05-17 and if sunday then next monday': {
          substitute: true,
          name: {
            fr: 'Journée de la Révolution et des Forces Armées',
            en: 'Liberation Day'
          }
        },
        '06-30 and if sunday then next monday': {
          substitute: true,
          _name: 'Independence Day',
          name: {
            fr: 'Anniversaire de Indépendance'
          }
        },
        '08-01 and if sunday then next monday': {
          substitute: true,
          name: {
            fr: 'Fête des parents',
            en: "Parents' Day"
          }
        },
        '12-25 and if sunday then next monday': {
          substitute: true,
          _name: '12-25'
        },
        '2016-01-15': {
          _name: 'Public Holiday'
        }
      }
    },
    CF: {
      names: {
        fr: 'République centrafricaine',
        sg: 'Ködörösêse tî Bêafrîka',
        en: 'Central African Republic'
      },
      dayoff: 'sunday',
      langs: [
        'fr',
        'sg'
      ],
      zones: [
        'Africa/Lagos'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '03-29': {
          name: {
            fr: 'Décès du Fondateur Barthélémy Boganda',
            en: 'Boganda Day'
          }
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01'
        },
        'easter 39': {
          _name: 'easter 39'
        },
        'easter 50': {
          _name: 'easter 50'
        },
        '06-30': {
          name: {
            fr: 'Journée de prière',
            en: 'General Prayer Day'
          }
        },
        '08-13': {
          _name: 'Independence Day'
        },
        '08-15': {
          _name: '08-15'
        },
        '11-01': {
          _name: '11-01'
        },
        '12-01': {
          name: {
            fr: 'Jour de la République',
            en: 'Republic Day'
          }
        },
        '12-25': {
          _name: '12-25'
        },
        '1 Shawwal': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah'
        }
      }
    },
    CG: {
      names: {
        fr: 'République du Congo',
        en: 'Republic of the Congo'
      },
      dayoff: 'sunday',
      langs: [
        'fr',
        'en'
      ],
      zones: [
        'Africa/Lagos'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01'
        },
        'easter 39': {
          _name: 'easter 39'
        },
        'easter 49': {
          _name: 'easter 49'
        },
        'easter 50': {
          _name: 'easter 50'
        },
        '06-10': {
          name: {
            fr: 'Fête de la commémoration de la conférence nationale souveraine'
          }
        },
        '08-15': {
          _name: '08-15'
        },
        '11-01': {
          _name: '11-01'
        },
        '11-28': {
          name: {
            fr: 'Journée nationale de la République'
          }
        },
        '12-25': {
          _name: '12-25'
        }
      }
    },
    CH: {
      names: {
        de: 'Schweiz',
        fr: 'Suisse',
        it: 'Svizzera',
        en: 'Switzerland'
      },
      dayoff: 'sunday',
      langs: [
        'de-ch',
        'de',
        'fr',
        'it'
      ],
      zones: [
        'Europe/Zurich'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        'easter -3': {
          _name: 'easter -3',
          type: 'observance'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        'easter 39': {
          _name: 'easter 39',
          name: {
            de: 'Auffahrt'
          }
        },
        'easter 49': {
          _name: 'easter 49'
        },
        'easter 50': {
          _name: 'easter 50'
        },
        '2nd sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        '1st sunday in June': {
          name: {
            de: 'Vätertag',
            fr: 'Fête des pères'
          },
          type: 'observance',
          active: [
            {
              from: '2009-01-01'
            }
          ]
        },
        '08-01': {
          name: {
            de: 'Bundesfeiertag',
            fr: 'Fête nationnale',
            it: 'Giorno festivo federale'
          }
        },
        '3rd sunday after 09-01': {
          name: {
            de: 'Eidg. Dank-, Buss- und Bettag',
            fr: 'Jeûne fédéral',
            it: 'Digiuno federale',
            en: 'Federal Day of Thanksgiving, Repentance and Prayer'
          }
        },
        '12-25': {
          _name: '12-25',
          name: {
            de: 'Weihnachtstag'
          }
        },
        '12-26': {
          _name: '12-26',
          name: {
            de: 'Stephanstag',
            fr: 'Saint-Etienne'
          }
        }
      },
      states: {
        ZH: {
          names: {
            de: 'Kanton Zürich',
            fr: 'Canton de Zurich',
            it: 'Canton Zurigo',
            en: 'Canton of Zürich'
          },
          days: {
            '01-02': {
              name: {
                de: 'Berchtoldstag',
                fr: 'Saint-Berthold'
              },
              type: 'optional'
            },
            '05-01': {
              _name: '05-01'
            },
            'easter 50': {
              _name: 'easter 50'
            },
            'monday after 2nd saturday in September 13:00': {
              name: {
                de: 'Knabenschiessen'
              },
              type: 'optional'
            }
          }
        },
        BE: {
          names: {
            de: 'Kanton Bern',
            fr: 'Canton de Berne',
            it: 'Canton Berna',
            en: 'Canton of Bern'
          },
          days: {
            '01-02': {
              name: {
                de: 'Berchtoldstag',
                fr: '2 janvier'
              }
            }
          }
        },
        LU: {
          names: {
            de: 'Kanton Luzern',
            fr: 'Canton de Lucerne',
            it: 'Canton Lucerna',
            en: 'Canton of Lucerne'
          },
          days: {
            '01-02': {
              name: {
                de: 'Berchtoldstag',
                fr: 'Saint-Berthold'
              },
              type: 'optional'
            },
            '03-19': {
              _name: '03-19',
              type: 'observance'
            },
            'easter 1': {
              _name: 'easter 1',
              type: 'optional'
            },
            'easter 50': {
              _name: 'easter 50',
              type: 'optional'
            },
            'easter 60': {
              _name: 'easter 60'
            },
            '08-15': {
              _name: '08-15'
            },
            '11-01': {
              _name: '11-01'
            },
            '12-08': {
              _name: '12-08'
            }
          }
        },
        UR: {
          names: {
            de: 'Kanton Uri',
            fr: "Canton d'Uri",
            it: 'Canton Uri',
            en: 'Canton of Uri'
          },
          days: {
            '01-06': {
              _name: '01-06'
            },
            '03-19': {
              _name: '03-19'
            },
            'easter 60': {
              _name: 'easter 60'
            },
            '08-15': {
              _name: '08-15'
            },
            '11-01': {
              _name: '11-01'
            },
            '12-08': {
              _name: '12-08'
            },
            '12-26': false,
            '12-26 not on monday, friday': {
              _name: '12-26'
            }
          }
        },
        SZ: {
          names: {
            de: 'Kanton Schwyz',
            fr: 'Canton de Schwytz',
            it: 'Canton Svitto',
            en: 'Canton of Schwyz'
          },
          days: {
            '01-06': {
              _name: '01-06'
            },
            '03-19': {
              _name: '03-19'
            },
            'easter 60': {
              _name: 'easter 60'
            },
            '08-15': {
              _name: '08-15'
            },
            '11-01': {
              _name: '11-01'
            },
            '12-08': {
              _name: '12-08'
            }
          }
        },
        OW: {
          names: {
            de: 'Kanton Obwalden',
            fr: "Canton d'Obwald",
            it: 'Canton Obvaldo',
            en: 'Canton of Obwalden'
          },
          days: {
            '01-02': {
              name: {
                de: 'Berchtoldstag',
                fr: 'Saint-Berthold'
              },
              type: 'optional'
            },
            'easter 1': {
              _name: 'easter 1',
              type: 'optional'
            },
            'easter 50': {
              _name: 'easter 50',
              type: 'optional'
            },
            'easter 60': {
              _name: 'easter 60'
            },
            '08-15': {
              _name: '08-15'
            },
            '09-25': {
              name: {
                de: 'Bruderklausenfest',
                fr: 'Saint-Nicholas-de-Flüe',
                en: 'Saint Nicholas of Flüe'
              }
            },
            '11-01': {
              _name: '11-01'
            },
            '12-08': {
              _name: '12-08'
            },
            '12-26': {
              _name: '12-26',
              type: 'optional'
            }
          }
        },
        NW: {
          names: {
            de: 'Kanton Nidwalden',
            fr: 'Canton de Nidwald',
            it: 'Canton Nidvaldo',
            en: 'Canton of Nidwalden'
          },
          days: {
            '01-02': {
              name: {
                de: 'Berchtoldstag',
                fr: 'Saint-Berthold'
              },
              type: 'bank'
            },
            '03-19': {
              _name: '03-19'
            },
            'easter 1': {
              _name: 'easter 1',
              type: 'optional'
            },
            'easter 50': {
              _name: 'easter 50',
              type: 'optional'
            },
            'easter 60': {
              _name: 'easter 60'
            },
            '08-15': {
              _name: '08-15'
            },
            '11-01': {
              _name: '11-01'
            },
            '12-08': {
              _name: '12-08'
            },
            '12-26': {
              _name: '12-26',
              type: 'optional'
            }
          }
        },
        GL: {
          sources: [
            'https://www.gl.ch/verwaltung/staatskanzlei/oeffentliche-feiertage.html/1335'
          ],
          names: {
            de: 'Kanton Glarus',
            fr: 'Canton de Glaris',
            it: 'Canton Glarona',
            en: 'Canton of Glarus'
          },
          days: {
            '01-02': {
              name: {
                de: 'Berchtoldstag',
                fr: 'Saint-Berthold'
              },
              type: 'optional'
            },
            'Thursday after 04-02 if is observance holiday then next Thursday': {
              name: {
                de: 'Näfelser Fahrt',
                fr: 'Bataille de Näfels'
              }
            },
            '3rd sunday after 09-01': false,
            '11-01': {
              _name: '11-01'
            },
            '12-24': {
              _name: '12-24'
            },
            '12-31': {
              _name: '12-31'
            }
          }
        },
        ZG: {
          names: {
            de: 'Kanton Zug',
            fr: 'Canton de Zoug',
            it: 'Canton Zugo',
            en: 'Canton of Zug'
          },
          days: {
            '01-02': {
              name: {
                de: 'Berchtoldstag',
                fr: 'Saint-Berthold'
              },
              type: 'optional'
            },
            'easter 1': {
              _name: 'easter 1',
              type: 'optional'
            },
            'easter 50': {
              _name: 'easter 50',
              type: 'optional'
            },
            'easter 60': {
              _name: 'easter 60'
            },
            '08-15': {
              _name: '08-15'
            },
            '11-01': {
              _name: '11-01'
            },
            '12-08': {
              _name: '12-08'
            },
            '12-26': {
              _name: '12-26',
              type: 'optional'
            }
          }
        },
        FR: {
          names: {
            fr: 'Canton de Fribourg',
            de: 'Kanton Freiburg',
            it: 'Canton Friburgo',
            en: 'Canton of Fribourg'
          },
          langs: [
            'fr',
            'de-ch',
            'de',
            'it'
          ],
          days: {
            '01-02': {
              name: {
                de: 'Berchtoldstag',
                fr: 'Saint-Berthold'
              },
              type: 'optional'
            },
            'easter 1': {
              _name: 'easter 1',
              type: 'optional'
            },
            'easter 50': {
              _name: 'easter 50',
              type: 'optional'
            },
            'easter 60': {
              _name: 'easter 60',
              note: 'excluding communities: Agriswil, Altavilla, Büchslen, Cordast, Courgevaux, Courlevon, Fräschels, Galmiz, Gempenach, Greng, Jeuss, Kerzers, Lurtigen, Meyriez, Muntelier, Murten, Ried bei Kerzers (halb), Salvenach, Ulmiz, Bas-Vully, Haut-Vully\n'
            },
            '08-15': {
              _name: '08-15',
              note: 'excluding communities: Agriswil, Altavilla, Büchslen, Cordast, Courgevaux, Courlevon, Fräschels, Galmiz, Gempenach, Greng, Jeuss, Kerzers, Lurtigen, Meyriez, Muntelier, Murten, Ried bei Kerzers (halb), Salvenach, Ulmiz, Bas-Vully, Haut-Vully\n'
            },
            '11-01': {
              _name: '11-01',
              note: 'excluding communities: Agriswil, Altavilla, Büchslen, Cordast, Courgevaux, Courlevon, Fräschels, Galmiz, Gempenach, Greng, Jeuss, Kerzers, Lurtigen, Meyriez, Muntelier, Murten, Ried bei Kerzers (halb), Salvenach, Ulmiz, Bas-Vully, Haut-Vully\n'
            },
            '12-08': {
              _name: '12-08',
              note: 'excluding communities: Agriswil, Altavilla, Büchslen, Cordast, Courgevaux, Courlevon, Fräschels, Galmiz, Gempenach, Greng, Jeuss, Kerzers, Lurtigen, Meyriez, Muntelier, Murten, Ried bei Kerzers (halb), Salvenach, Ulmiz, Bas-Vully, Haut-Vully\n'
            },
            '12-26': {
              _name: '12-26',
              type: 'optional'
            }
          }
        },
        SO: {
          names: {
            de: 'Kanton Solothurn',
            fr: 'Canton de Soleure',
            it: 'Canton Soletta',
            en: 'Canton of Solothurn'
          },
          days: {
            '01-02': {
              name: {
                de: 'Berchtoldstag',
                fr: 'Saint-Berthold'
              },
              type: 'optional'
            },
            '03-19': {
              _name: '03-19',
              note: 'Only in communities: Fulenbach, Walterswil, Wisen, Metzerlen, Nulgar-St. Pantaleon, Rodersdorf, Bärschwil, Büsserach\n'
            },
            'easter 1': {
              _name: 'easter 1',
              type: 'optional'
            },
            '05-01 12:00': {
              _name: '05-01'
            },
            'easter 50': {
              _name: 'easter 50',
              type: 'optional'
            },
            'easter 60': {
              _name: 'easter 60',
              note: 'is optional in Bucheggberg'
            },
            '08-15': {
              _name: '08-15',
              note: 'is optional in Bucheggberg'
            },
            '11-01': {
              _name: '11-01',
              note: 'is optional in Bucheggberg'
            },
            '12-26': {
              _name: '12-26',
              type: 'optional'
            }
          }
        },
        BS: {
          names: {
            de: 'Kanton Basel-Stadt',
            fr: 'Canton de Bâle-Ville',
            it: 'Canton Basilea Città',
            en: 'Canton of Basel-City'
          },
          days: {
            '05-01': {
              _name: '05-01'
            }
          }
        },
        BL: {
          names: {
            de: 'Kanton Basel-Landschaft',
            fr: 'Canton de Bâle-Campagne',
            it: 'Canton Basilea Campagna',
            en: 'Canton of Basel-Country'
          },
          days: {
            '05-01': {
              _name: '05-01'
            },
            'easter 60': {
              _name: 'easter 60',
              type: 'observance'
            }
          }
        },
        SH: {
          names: {
            de: 'Kanton Schaffhausen',
            fr: 'Canton de Schaffhouse',
            it: 'Canton Sciaffusa',
            en: 'Canton of Schaffhausen'
          },
          days: {
            '01-02': {
              name: {
                de: 'Berchtoldstag',
                fr: 'Saint-Berthold'
              },
              type: 'optional'
            },
            '05-01': {
              _name: '05-01'
            }
          }
        },
        AR: {
          names: {
            de: 'Kanton Appenzell Ausserrhoden',
            fr: "Canton d'Appenzell Rhodes-Extérieures",
            it: 'Canton Appenzello Esterno',
            en: 'Canton of Appenzell Outer Rhodes'
          },
          days: {
            '12-26': false,
            '12-26 not on monday': {
              _name: '12-26'
            }
          }
        },
        AI: {
          names: {
            de: 'Kanton Appenzell Innerrhoden',
            fr: "Canton d'Appenzell Rhodes-Intérieures",
            it: 'Canton Appenzello Interno',
            en: 'Canton of Appenzell Inner-Rhodes'
          },
          days: {
            'easter 60': {
              _name: 'easter 60'
            },
            '08-15': {
              _name: '08-15'
            },
            '09-22': {
              name: {
                de: 'Mauritiustag'
              },
              note: 'excluding: Bezirk Oberegg\n'
            },
            '11-01': {
              _name: '11-01'
            },
            '12-26': {
              type: 'observance'
            },
            '12-26 not on tuesday, saturday': {
              _name: '12-26'
            }
          }
        },
        SG: {
          names: {
            de: 'Kanton St. Gallen',
            fr: 'Canton de Saint-Gall',
            it: 'Canton San Gallo',
            en: 'Canton of St. Gallen'
          },
          days: {
            '11-01': {
              _name: '11-01'
            }
          }
        },
        GR: {
          names: {
            de: 'Kanton Graubünden',
            it: 'Cantone dei Grigioni',
            fr: 'Canton des Grisons',
            en: 'Canton of Grisons'
          },
          langs: [
            'de-ch',
            'de',
            'it',
            'fr'
          ],
          days: {
            '01-06': {
              _name: '01-06',
              type: 'observance'
            },
            '03-19': {
              _name: '03-19',
              type: 'observance'
            },
            'easter -2': {
              _name: 'easter -2',
              type: 'optional'
            },
            'easter 60': {
              _name: 'easter 60',
              type: 'observance'
            },
            '08-15': {
              _name: '08-15',
              type: 'observance'
            },
            '11-01': {
              _name: '11-01',
              type: 'observance'
            },
            '12-08': {
              _name: '12-08',
              type: 'observance'
            }
          }
        },
        AG: {
          names: {
            de: 'Kanton Aargau',
            fr: "Canton d'Argovie",
            it: 'Canton Argovia',
            en: 'Canton of Aargau'
          },
          days: {
            '01-02': {
              name: {
                de: 'Berchtoldstag',
                fr: 'Saint-Berthold'
              }
            },
            '05-01': {
              _name: '05-01'
            },
            'easter 60': {
              _name: 'easter 60'
            },
            '08-15': {
              _name: '08-15'
            },
            '11-01': {
              _name: '11-01'
            },
            '12-08': {
              _name: '12-08'
            }
          }
        },
        TG: {
          names: {
            de: 'Kanton Thurgau',
            fr: 'Canton de Thurgovie',
            it: 'Canton Turgovia',
            en: 'Canton of Thurgau'
          },
          days: {
            '01-02': {
              name: {
                de: 'Berchtoldstag',
                fr: 'Saint-Berthold'
              }
            },
            '05-01': {
              _name: '05-01'
            }
          }
        },
        TI: {
          names: {
            it: 'Canton Ticino',
            de: 'Kanton Tessin',
            fr: 'Canton du Tessin',
            en: 'Canton of Ticino'
          },
          langs: [
            'it',
            'de-ch',
            'de',
            'fr'
          ],
          days: {
            '01-02': {
              name: {
                de: 'Berchtoldstag',
                fr: 'Saint-Berthold'
              },
              type: 'bank'
            },
            '01-06': {
              _name: '01-06',
              name: {
                it: 'Epifania'
              }
            },
            '03-19': {
              _name: '03-19'
            },
            'easter -2': false,
            'easter 60': {
              _name: 'easter 60'
            },
            '05-01': {
              _name: '05-01'
            },
            '06-29': {
              _name: '06-29'
            },
            '1st sunday in June': false,
            '08-15': {
              _name: '08-15',
              name: {
                it: 'Assunzione'
              }
            },
            '11-01': {
              _name: '11-01'
            },
            '12-08': {
              _name: '12-08'
            }
          }
        },
        VD: {
          names: {
            fr: 'Canton de Vaud',
            de: 'Kanton Waadt',
            it: 'Canton Vaud',
            en: 'Canton of Vaud'
          },
          langs: [
            'fr',
            'de-ch',
            'de',
            'it'
          ],
          days: {
            '01-02': {
              name: {
                de: 'Berchtoldstag',
                fr: '2 Janvier'
              }
            },
            'monday after 3rd sunday in September': {
              name: {
                de: 'Bettagsmontag',
                fr: 'Lundi du Jeûne Fédéral',
                en: 'Monday after Federal Day of Thanksgiving, Repentance and Prayer'
              }
            },
            '12-26': false
          }
        },
        VS: {
          names: {
            fr: 'Canton du Valais',
            de: 'Kanton Wallis',
            it: 'Canton Vallese',
            en: 'Canton of Valais'
          },
          langs: [
            'fr',
            'de-ch',
            'de',
            'it'
          ],
          days: {
            '01-02': {
              name: {
                de: 'Berchtoldstag',
                fr: 'Saint-Berthold'
              },
              type: 'bank'
            },
            '03-19': {
              _name: '03-19'
            },
            'easter -2': false,
            'easter 1': {
              _name: 'easter 1',
              type: 'optional'
            },
            '05-01 12:00': {
              _name: '05-01'
            },
            'easter 50': {
              _name: 'easter 50'
            },
            'easter 60': {
              _name: 'easter 60'
            },
            '08-15': {
              _name: '08-15'
            },
            'monday after 3rd sunday after 09-01': {
              name: {
                de: 'Bettagsmontag',
                fr: 'Lundi du Jeûne Fédéral',
                en: 'Monday after Federal Day of Thanksgiving, Repentance and Prayer'
              },
              type: 'bank'
            },
            '11-01': {
              _name: '11-01'
            },
            '12-08': {
              _name: '12-08'
            },
            '12-24 12:00': {
              _name: '12-24'
            },
            '12-26': {
              type: 'optional'
            }
          }
        },
        NE: {
          names: {
            fr: 'Canton de Neuchâtel',
            de: 'Kanton Neuenburg',
            it: 'Canton Neuchâtel',
            en: 'Canton of Neuchâtel'
          },
          langs: [
            'fr',
            'de-ch',
            'de',
            'it'
          ],
          days: {
            '01-02 on monday': {
              name: {
                de: 'Berchtoldstag',
                fr: '2 Janvier'
              }
            },
            '01-02': {
              name: {
                de: 'Berchtoldstag',
                fr: '2 Janvier'
              },
              type: 'observance'
            },
            '03-01': {
              name: {
                fr: 'Instauration de la République',
                de: 'Jahrestag Ausrufung der Republik'
              }
            },
            'easter -2': {
              _name: 'easter -2'
            },
            '05-01': {
              _name: '05-01'
            },
            'easter 50': {
              _name: 'easter 50',
              type: 'observance'
            },
            'easter 60': {
              _name: 'easter 60'
            },
            'monday after 3rd sunday in September': {
              name: {
                de: 'Bettagsmontag',
                fr: 'Lundi du Jeûne Fédéral',
                en: 'Monday after Federal Day of Thanksgiving, Repentance and Prayer'
              },
              type: 'optional'
            },
            '12-26': {
              type: 'observance'
            },
            '12-26 on monday': {
              _name: '12-26'
            }
          }
        },
        GE: {
          names: {
            fr: 'Canton de Genève',
            de: 'Kanton Genf',
            it: 'Canton Ginevra',
            en: 'Canton of Geneva'
          },
          langs: [
            'fr',
            'de-ch',
            'de',
            'it'
          ],
          days: {
            '01-02': {
              name: {
                de: 'Berchtoldstag',
                fr: '2 Janvier'
              },
              type: 'bank'
            },
            'thursday after 1st sunday after 09-01': {
              name: {
                de: 'Genfer Bettag',
                fr: 'Jeûne Genevois'
              }
            },
            '12-26': {
              type: 'bank'
            },
            '12-31': {
              name: {
                de: 'Wiederherstellung der Republik',
                fr: 'Restauration de la République',
                en: 'Restoration of the Republic'
              }
            }
          }
        },
        JU: {
          names: {
            fr: 'Canton du Jura',
            de: 'Kanton Jura',
            it: 'Canton Giura',
            en: 'Canton of Jura'
          },
          langs: [
            'fr',
            'de-ch',
            'de',
            'it'
          ],
          days: {
            '01-02': {
              name: {
                de: 'Berchtoldstag',
                fr: '2 Janvier'
              }
            },
            '05-01': {
              _name: '05-01'
            },
            'easter 60': {
              _name: 'easter 60'
            },
            '06-23': {
              name: {
                fr: 'Plébiscite jurassien',
                en: 'Jura Plebiscite',
                de: 'Fest der Unabhängigkeit'
              }
            },
            '08-15': {
              _name: '08-15'
            },
            '11-01': {
              _name: '11-01'
            },
            '12-26': false
          }
        }
      }
    },
    CI: {
      names: {
        fr: "République de Côte d'Ivoire",
        en: "Republic of Côte d'Ivoire"
      },
      langs: [
        'fr',
        'en'
      ],
      zones: [
        'Africa/Abidjan'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01'
        },
        'easter 39': {
          _name: 'easter 39'
        },
        'easter 50': {
          _name: 'easter 50'
        },
        '08-07 since 1960': {
          _name: 'Independence Day'
        },
        '08-15': {
          _name: '08-15'
        },
        '11-01': {
          _name: '11-01'
        },
        '11-15 since 1996': {
          name: {
            en: 'National Peace Day'
          }
        },
        '12-25': {
          _name: '12-25'
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal'
        },
        '27 Ramadan': {
          _name: '27 Ramadan'
        },
        '1 Shawwal': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah'
        }
      }
    },
    CK: {
      names: {
        rar: "Kūki 'Āirani",
        en: 'Cook Islands'
      },
      langs: [
        'en',
        'rar'
      ],
      zones: [
        'Pacific/Rarotonga'
      ],
      dayoff: 'sunday',
      days: {
        '01-01 and if Saturday, Sunday then next Monday': {
          substitute: true,
          _name: '01-01'
        },
        '01-02 and if Saturday then next Monday if Monday, Sunday then next Tuesday': {
          substitute: true,
          name: {
            en: "Day after New Year's Day"
          }
        },
        '04-25': {
          name: {
            en: 'Anzac Day'
          }
        },
        'easter -2': {
          _name: 'easter -2'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '1st Monday in June': {
          name: {
            en: "Queen's Birthday"
          }
        },
        '1st Friday in July': {
          name: {
            en: 'Ra o te Ui Ariki (House of Ariki)',
            rar: 'Ra o te Ui Ariki'
          }
        },
        '08-04 and if Saturday, Sunday then next Monday': {
          substitute: true,
          _name: 'Constitution Day'
        },
        '10-26 and if Saturday, Sunday then next Monday': {
          substitute: true,
          name: {
            en: 'National Gospel Day'
          }
        },
        '12-25 and if Saturday, Sunday then next Monday': {
          substitute: true,
          _name: '12-25'
        },
        '12-26 and if Saturday then next Monday if Monday, Sunday then next Tuesday': {
          substitute: true,
          _name: '12-26'
        }
      },
      states: {
        Aitutaki: {
          names: {
            en: 'Aitutaki'
          },
          days: {
            '10-26 and if Saturday, Sunday then next Monday': {
              substitute: true,
              name: {
                en: 'Aitutaki Gospel Day'
              }
            }
          }
        },
        Atiu: {
          names: {
            en: 'Atiu'
          },
          days: {
            '07-19 and if Saturday, Sunday then next Monday': {
              substitute: true,
              name: {
                en: 'Atiu Gospel Day'
              }
            }
          }
        },
        Mangaia: {
          names: {
            en: 'Mangaia'
          },
          days: {
            '06-15 and if Saturday, Sunday then next Monday': {
              substitute: true,
              name: {
                en: 'Mangaia Gospel Day'
              }
            }
          }
        },
        Manihiki: {
          names: {
            en: 'Manihiki'
          },
          days: {
            '08-08 and if Saturday, Sunday then next Monday': {
              substitute: true,
              name: {
                en: 'Manihiki Gospel Day'
              }
            }
          }
        },
        Mitiaro: {
          names: {
            en: 'Mitiaro'
          },
          days: {
            '07-21 and if Saturday, Sunday then next Monday': {
              substitute: true,
              name: {
                en: 'Mitiaro Gospel Day'
              }
            }
          }
        },
        Palmerston: {
          names: {
            en: 'Palmerston'
          },
          days: {
            '05-25 and if Saturday, Sunday then next Monday': {
              substitute: true,
              name: {
                en: 'Palmerston Gospel Day'
              }
            }
          }
        },
        Penrhyn: {
          names: {
            en: 'Penrhyn'
          },
          days: {
            '05-13 and if Saturday, Sunday then next Monday': {
              substitute: true,
              name: {
                en: 'Penrhyn Gospel Day'
              }
            }
          }
        },
        Pukapuka: {
          names: {
            en: 'Pukapuka'
          },
          days: {
            '12-06 and if Saturday, Sunday then next Monday': {
              substitute: true,
              name: {
                en: 'Pukapuka Gospel Day'
              }
            }
          }
        },
        Rakahanga: {
          names: {
            en: 'Rakahanga'
          },
          days: {
            '08-15 and if Saturday, Sunday then next Monday': {
              substitute: true,
              name: {
                en: 'Rakahanga Gospel Day'
              }
            }
          }
        },
        Rarotonga: {
          names: {
            en: 'Rarotonga'
          },
          days: {
            '07-25 and if Saturday, Sunday then next Monday': {
              substitute: true,
              name: {
                en: 'Rarotonga Gospel Day'
              }
            }
          }
        }
      }
    },
    CL: {
      names: {
        es: 'Chile',
        en: 'Chile'
      },
      dayoff: 'sunday',
      langs: [
        'es'
      ],
      zones: [
        'America/Santiago',
        'Pacific/Easter'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter'
        },
        '05-01': {
          _name: '05-01'
        },
        '05-21': {
          name: {
            en: 'Navy Day',
            es: 'Día de las Glorias Navales'
          }
        },
        '06-29': {
          _name: '06-29'
        },
        '07-16': {
          name: {
            en: 'Our Lady of Mount Carmel',
            es: 'Virgen del Carmen'
          }
        },
        '08-15': {
          _name: '08-15'
        },
        '09-18': {
          name: {
            en: 'National holiday',
            es: 'Fiestas Patrias'
          }
        },
        '09-19': {
          name: {
            en: 'Army Day',
            es: 'Día de las Glorias del Ejército'
          }
        },
        '10-12': {
          name: {
            en: 'Columbus Day',
            es: 'Día del Descubrimiento de Dos Mundos'
          }
        },
        '10-31 if wednesday then next friday if tuesday then previous friday': {
          _name: 'Reformation Day'
        },
        '11-01': {
          _name: '11-01'
        },
        '12-08': {
          _name: '12-08'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-31': {
          _name: '12-31',
          type: 'bank'
        }
      },
      states: {
        AP: {
          name: 'Arica y Parinacota',
          days: {
            '06-07': {
              name: {
                en: 'Battle of Arica',
                es: 'Asalto y Toma del Morro de Arica'
              }
            }
          }
        },
        BI: {
          name: 'Biobío',
          regions: {
            CH: {
              name: 'Chillán y Chillán Viejo',
              days: {
                '08-20': {
                  name: {
                    en: "Nativity of Liberator Bernardo O'Higgins",
                    es: 'Nacimiento del Prócer de la Independencia'
                  }
                }
              }
            }
          }
        },
        TA: {
          name: 'Tarapacá',
          days: {
            '08-10': {
              name: {
                en: 'Saint Lawrence',
                es: 'San Lorenzo de Tarapacá'
              }
            }
          }
        }
      }
    },
    CM: {
      names: {
        fr: 'Cameroun',
        en: 'Cameroon'
      },
      dayoff: 'sunday',
      langs: [
        'fr',
        'en'
      ],
      zones: [
        'Africa/Lagos'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '02-11': {
          name: {
            fr: 'Fête de la Jeunesse',
            en: 'Youth Day'
          }
        },
        'easter -2': {
          _name: 'easter -2'
        },
        '05-01 if sunday then next monday': {
          _name: '05-01'
        },
        '05-20': {
          name: {
            fr: "Fête nationale ou de l'unité",
            en: 'National Day'
          }
        },
        'easter 39': {
          _name: 'easter 39'
        },
        '08-15': {
          _name: '08-15'
        },
        '12-25': {
          _name: '12-25'
        },
        '1 Shawwal': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah'
        }
      }
    },
    CN: {
      names: {
        en: 'China',
        zh: '中华人民共和国'
      },
      dayoff: 'sunday',
      langs: [
        'zh',
        'en'
      ],
      zones: [
        'Asia/Shanghai',
        'Asia/Urumqi'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '03-08 12:00': {
          _name: '03-08',
          note: 'Women'
        },
        '05-01': {
          _name: '05-01'
        },
        '05-04 12:00': {
          name: {
            en: 'Youth Day',
            zh: '青年节'
          },
          note: 'Youth from the age of 14 to 28'
        },
        '06-01': {
          name: {
            en: "Children's Day",
            zh: '六一儿童节'
          },
          note: 'Children below the age of 14'
        },
        '08-01 12:00': {
          name: {
            en: 'Army Day',
            zh: '建军节'
          },
          note: 'Military personnel in active service'
        },
        '10-01': {
          name: {
            en: 'National Day',
            zh: '国庆节'
          }
        },
        '10-02': {
          name: {
            en: 'National Day',
            zh: '国庆节'
          }
        },
        '10-03': {
          name: {
            en: 'National Day',
            zh: '国庆节'
          }
        },
        'chinese 01-0-00': {
          name: {
            en: 'Spring Festival',
            zh: '春节'
          }
        },
        'chinese 01-0-01': {
          name: {
            en: 'Spring Festival',
            zh: '春节'
          }
        },
        'chinese 01-0-02': {
          name: {
            en: 'Spring Festival',
            zh: '春节'
          }
        },
        'chinese 5-01 solarterm': {
          name: {
            en: 'Qingming Festival',
            zh: '清明节 清明節'
          }
        },
        'chinese 05-0-05': {
          name: {
            en: 'Dragon Boat Festival',
            zh: '端午节'
          }
        },
        'chinese 08-0-15': {
          name: {
            en: 'Mid-Autumn Festival',
            zh: '中秋节'
          }
        },
        '2021-01-02': {
          _name: '01-01'
        },
        '2021-01-03': {
          _name: '01-01'
        },
        '2021-02-14': {
          name: {
            en: 'Spring Festival',
            zh: '春节'
          },
          note: 'Work on Sun February 7 and Sat February 20.'
        },
        '2021-02-15': {
          name: {
            en: 'Spring Festival',
            zh: '春节'
          }
        },
        '2021-02-16': {
          name: {
            en: 'Spring Festival',
            zh: '春节'
          }
        },
        '2021-02-17': {
          name: {
            en: 'Spring Festival',
            zh: '春节'
          }
        },
        '2021-04-03': {
          name: {
            en: 'Qingming Festival',
            zh: '清明节 清明節'
          }
        },
        '2021-04-05': {
          name: {
            en: 'Qingming Festival',
            zh: '清明节 清明節'
          }
        },
        '2021-05-02': {
          _name: '05-01',
          note: 'Work on Sun April 25 and Sat May 8.'
        },
        '2021-05-03': {
          _name: '05-01'
        },
        '2021-05-04': {
          _name: '05-01'
        },
        '2021-05-05': {
          _name: '05-01'
        },
        '2021-06-12': {
          name: {
            en: 'Dragon Boat Festival',
            zh: '端午节'
          }
        },
        '2021-06-13': {
          name: {
            en: 'Dragon Boat Festival',
            zh: '端午节'
          }
        },
        '2021-09-19': {
          name: {
            en: 'Mid-Autumn Festival',
            zh: '中秋节'
          },
          note: 'Work on Sat September 18.'
        },
        '2021-09-20': {
          name: {
            en: 'Mid-Autumn Festival',
            zh: '中秋节'
          }
        },
        '2021-10-04': {
          name: {
            en: 'National Day',
            zh: '国庆节'
          },
          note: 'Work on Sun September 26 and Sat October 9.'
        },
        '2021-10-05': {
          name: {
            en: 'National Day',
            zh: '国庆节'
          }
        },
        '2021-10-06': {
          name: {
            en: 'National Day',
            zh: '国庆节'
          }
        },
        '2021-10-07': {
          name: {
            en: 'National Day',
            zh: '国庆节'
          }
        }
      }
    },
    CO: {
      names: {
        es: 'Colombia',
        en: 'Colombia'
      },
      dayoff: 'sunday',
      langs: [
        'es'
      ],
      zones: [
        'America/Bogota'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        'monday after 01-06': {
          _name: '01-06'
        },
        'monday after 03-19': {
          _name: '03-19'
        },
        'easter -7': {
          _name: 'easter -7',
          type: 'observance'
        },
        'easter -3': {
          _name: 'easter -3'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter'
        },
        '05-01': {
          _name: '05-01'
        },
        'easter 43': {
          _name: 'easter 39'
        },
        'easter 64': {
          _name: 'easter 60'
        },
        'easter 71': {
          name: {
            es: 'Sagrado Corazón de Jesús',
            en: 'Sacred Heart'
          }
        },
        'monday after 06-29': {
          _name: '06-29'
        },
        '07-20': {
          _name: 'Independence Day'
        },
        '08-07': {
          name: {
            en: 'Battle of Boyacá',
            es: 'Batalla de Boyacá'
          }
        },
        'monday after 08-15': {
          _name: '08-15'
        },
        'monday after 10-12': {
          name: {
            es: 'Día de la Raza',
            en: 'Columbus Day'
          }
        },
        '1st monday in November': {
          _name: '11-01'
        },
        'monday after 11-11': {
          name: {
            es: 'Independencia de Cartagena',
            en: 'Independence of Cartagena'
          }
        },
        '12-08': {
          _name: '12-08'
        },
        '12-25': {
          _name: '12-25'
        }
      }
    },
    CR: {
      names: {
        es: 'Costa Rica',
        en: 'Costa Rica'
      },
      dayoff: 'sunday',
      langs: [
        'es'
      ],
      zones: [
        'America/Costa_Rica'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        'easter -3': {
          _name: 'easter -3'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        '04-11': {
          name: {
            es: 'Gesta Heroica de Juan Santamaría'
          }
        },
        '05-01': {
          _name: '05-01'
        },
        '07-25': {
          name: {
            en: 'Guanacaste Day',
            es: 'Anexión del Partido de Nicoya'
          }
        },
        '08-02': {
          name: {
            en: 'Our Lady of Los Ángeles',
            es: 'Día de la Virgen de los Ángeles'
          }
        },
        '08-15': {
          _name: 'Mothers Day'
        },
        '09-15': {
          _name: 'Independence Day'
        },
        '10-12 if monday then previous friday': {
          name: {
            en: 'Columbus Day',
            es: 'Día de la Raza'
          }
        },
        '12-25': {
          _name: '12-25'
        }
      }
    },
    CU: {
      names: {
        es: 'Cuba',
        en: 'Cuba'
      },
      dayoff: 'sunday',
      langs: [
        'es'
      ],
      zones: [
        'America/Havana'
      ],
      days: {
        '01-01': {
          name: {
            es: 'Triunfo de la Revolución',
            en: 'Triumph of the Revolution'
          }
        },
        '01-02': {
          name: {
            es: 'Día de Victoria de las Fuerzas Armadas',
            en: 'Victory of Armed Forces Day'
          }
        },
        'easter -2': {
          _name: 'easter -2'
        },
        '05-01': {
          _name: '05-01'
        },
        '07-25': {
          name: {
            es: 'Conmemoración del asalto a Moncada',
            en: 'Day before the Commemoration of the Assault of the Moncada garrison'
          }
        },
        '07-26': {
          name: {
            es: 'Día de la Rebeldía Nacional',
            en: 'Commemoration of the Assault of the Moncada garrison'
          }
        },
        '07-27': {
          name: {
            es: 'Conmemoración del asalto a Moncada',
            en: 'Day after the Commemoration of the Assault of the Moncada garrison'
          }
        },
        '10-10': {
          _name: 'Independence Day'
        },
        '12-25': {
          _name: '12-25'
        }
      }
    },
    CV: {
      names: {
        pt: 'República de Cabo Verde',
        en: 'Cape Verde'
      },
      langs: [
        'pt'
      ],
      zones: [
        'Atlantic/Cape_Verde'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-13': {
          name: {
            pt: 'Dia da Democracia',
            en: 'Democracy Day'
          }
        },
        '01-20': {
          name: {
            pt: 'Dia dos Heróis Nacionais',
            en: "Heroes' Day"
          }
        },
        'easter -47': {
          _name: 'easter -47'
        },
        'easter -46': {
          _name: 'easter -46'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        '05-01': {
          _name: '05-01'
        },
        '06-01': {
          name: {
            pt: 'Dia das Crianças',
            en: "Children's Day"
          }
        },
        '07-05': {
          _name: 'Independence Day'
        },
        '08-15': {
          _name: '08-15',
          name: {
            pt: 'Dia da Padroeira Nacional'
          }
        },
        '09-12': {
          name: {
            pt: 'Dia Nacional',
            en: 'National Day'
          }
        },
        '11-01': {
          _name: '11-01'
        },
        '12-25': {
          _name: '12-25'
        }
      },
      states: {
        S: {
          name: 'Sotavento Islands',
          regions: {
            PR: {
              name: 'Praia',
              days: {
                '05-19': {
                  name: {
                    pt: 'Dia do Município da Praia'
                  }
                }
              }
            }
          }
        }
      }
    },
    CW: {
      names: {
        nl: 'Curaçao',
        pap: 'Kòrsou',
        en: 'Curaçao'
      },
      langs: [
        'nl',
        'pap',
        'en'
      ],
      zones: [
        'America/Curacao'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        'easter -48': {
          _name: 'easter -48',
          name: {
            en: 'Carnival Monday'
          }
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '04-27': {
          name: {
            pap: 'Aña di Rey',
            nl: 'Koningsdag',
            en: 'Kings Day'
          }
        },
        '05-01 if sunday then next monday': {
          _name: '05-01'
        },
        '2nd sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        '1st sunday in June': {
          _name: 'Fathers Day',
          type: 'observance'
        },
        'easter 39': {
          _name: 'easter 39',
          name: {
            nl: 'Hemelvaartsdag'
          }
        },
        '07-02': {
          name: {
            nl: 'Dag van het volkslied en de Vlag',
            pap: 'Dia di Himno i Bandera',
            en: 'Flag Day'
          }
        },
        '10-10': {
          name: {
            nl: 'Dag van het land Curaçao',
            pap: 'Pais Kòrsou',
            en: 'Curaçao Day'
          }
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        },
        '12-31 12:00': {
          _name: '12-31'
        }
      }
    },
    CX: {
      names: {
        en: 'Christmas Island'
      },
      langs: [
        'en',
        'ms'
      ],
      zones: [
        'Indian/Christmas'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-26': {
          name: {
            en: 'Australia Day'
          }
        },
        'chinese 01-0-01 P2D': {
          name: {
            en: 'Chinese New Year',
            zh: '春节'
          }
        },
        '4th monday in March': {
          _name: '05-01'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        '04-25': {
          name: {
            en: 'Anzac Day'
          }
        },
        '1 Shawwal': {
          _name: '1 Shawwal',
          name: {
            ms: 'Hari Raya Puasa'
          }
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah',
          name: {
            ms: 'Hari Raya Haji'
          }
        },
        '10-06': {
          name: {
            en: 'Territory Day'
          }
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        }
      }
    },
    CY: {
      names: {
        el: 'Κύπρος',
        en: 'Cyprus'
      },
      dayoff: '',
      langs: [
        'el'
      ],
      zones: [
        'Asia/Nicosia'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-06': {
          _name: '01-06'
        },
        'orthodox -48': {
          name: {
            el: 'Καθαρά Δευτέρα',
            en: 'Ash Sunday'
          },
          type: 'observance'
        },
        'orthodox -47': {
          name: {
            el: 'Καθαρά Δευτέρα',
            en: 'Clean Monday'
          }
        },
        '03-25': {
          name: {
            el: 'Ευαγγελισμός, Εθνική Εορτή',
            en: 'Annunciation, Anniversary of 1821 Revolution'
          }
        },
        '04-01': {
          name: {
            en: 'Cyprus National Day',
            el: 'Κύπρος Εθνική Εορτή'
          }
        },
        'orthodox -2': {
          _name: 'easter -2'
        },
        orthodox: {
          _name: 'easter'
        },
        'orthodox 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01'
        },
        'orthodox 49': {
          _name: 'easter 49'
        },
        '2nd sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        '08-15': {
          _name: '08-15'
        },
        '10-01': {
          name: {
            en: 'Cyprus Independence Day',
            el: 'Ημέρα της Ανεξαρτησίας Κύπρος'
          }
        },
        '10-28': {
          _name: 'National Holiday',
          name: {
            el: 'Επέτειος του Όχι'
          }
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        }
      }
    },
    CZ: {
      names: {
        cz: 'Česká republika',
        en: 'Czech Republic'
      },
      langs: [
        'cz'
      ],
      zones: [
        'Europe/Prague'
      ],
      days: {
        '01-01': {
          _name: '01-01',
          name: {
            cz: 'Nový rok a Den obnovy samostatného českého státu'
          }
        },
        'easter -4': {
          name: {
            cz: 'Škaredá středa',
            en: 'Ugly Wednesday'
          },
          type: 'observance'
        },
        'easter -3': {
          _name: 'easter -3',
          type: 'observance'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        'easter -1': {
          _name: 'easter -1',
          type: 'observance'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01'
        },
        '05-08': {
          name: {
            cz: 'Den vítězství',
            en: 'Liberation Day'
          }
        },
        '2nd sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        '07-05': {
          name: {
            cz: 'Den slovanských věrozvěstů Cyrila a Metoděje',
            en: 'Saints Cyril and Methodius Day'
          }
        },
        '07-06': {
          name: {
            cz: 'Den upálení mistra Jana Husa',
            en: 'Jan Hus Day'
          }
        },
        '09-28': {
          name: {
            cz: 'Den české státnosti',
            en: 'St. Wenceslas Day (Czech Statehood Day)'
          }
        },
        '10-28': {
          name: {
            cz: 'Den vzniku samostatného československého státu',
            en: 'Independent Czechoslovak State Day'
          }
        },
        '11-17': {
          name: {
            cz: 'Den boje za svobodu a demokracii',
            en: 'Struggle for Freedom and Democracy Day'
          }
        },
        '12-24': {
          _name: '12-24'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        }
      }
    },
    DE: {
      names: {
        de: 'Deutschland',
        en: 'Germany'
      },
      dayoff: 'sunday',
      zones: [
        'Europe/Berlin'
      ],
      langs: [
        'de'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '02-14': {
          _name: '02-14',
          type: 'observance'
        },
        'easter -52': {
          name: {
            de: 'Weiberfastnacht',
            en: "Women's Carnival Day"
          },
          type: 'observance'
        },
        'easter -48': {
          name: {
            de: 'Rosenmontag',
            en: 'Shrove Monday'
          },
          type: 'observance'
        },
        'easter -47 14:00': {
          _name: 'easter -47',
          type: 'observance'
        },
        'easter -46': {
          _name: 'easter -46',
          type: 'observance'
        },
        'easter -3': {
          _name: 'easter -3',
          type: 'observance'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01',
          name: {
            de: 'Maifeiertag'
          }
        },
        '2nd sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        'easter 39': {
          _name: 'easter 39'
        },
        'easter 49': {
          _name: 'easter 49',
          type: 'observance'
        },
        'easter 50': {
          _name: 'easter 50'
        },
        '10-03': {
          _name: 'National Holiday',
          name: {
            de: 'Tag der Deutschen Einheit'
          }
        },
        '11-01': {
          _name: '11-01',
          type: 'observance'
        },
        '11-02': {
          _name: '11-02',
          type: 'observance'
        },
        '11-11': {
          _name: '11-11',
          type: 'observance'
        },
        'wednesday before 11-23': {
          _name: 'Buß- und Bettag',
          type: 'observance'
        },
        '6th sunday before 12-25': {
          name: {
            de: 'Volkstrauertag',
            en: 'Memorial Day'
          },
          type: 'observance'
        },
        '5th sunday before 12-25': {
          name: {
            de: 'Totensonntag'
          },
          type: 'observance'
        },
        '4th sunday before 12-25': {
          name: {
            de: '1. Advent'
          },
          type: 'observance'
        },
        '3th sunday before 12-25': {
          name: {
            de: '2. Advent'
          },
          type: 'observance'
        },
        '2nd sunday before 12-25': {
          name: {
            de: '3. Advent'
          },
          type: 'observance'
        },
        '1st sunday before 12-25': {
          name: {
            de: '4. Advent'
          },
          type: 'observance'
        },
        '12-24 14:00 if sunday then 00:00': {
          _name: '12-24',
          type: 'bank'
        },
        '12-25': {
          _name: '12-25',
          name: {
            de: '1. Weihnachtstag'
          }
        },
        '12-26': {
          _name: '12-26'
        },
        '12-31 14:00 if sunday then 00:00': {
          _name: '12-31',
          type: 'bank'
        },
        '2017-10-31': {
          _name: 'Reformation Day'
        }
      },
      states: {
        BB: {
          name: 'Brandenburg',
          days: {
            easter: {
              _name: 'easter'
            },
            'easter 49': {
              _name: 'easter 49'
            },
            '10-31': {
              _name: 'Reformation Day'
            }
          }
        },
        BE: {
          name: 'Berlin',
          days: {
            '03-08': {
              _name: '03-08',
              active: [
                {
                  from: '2019-01-01T00:00:00.000Z'
                }
              ]
            },
            easter: {
              _name: 'easter',
              type: 'observance'
            },
            'easter 49': {
              _name: 'easter 49',
              type: 'observance'
            },
            '2020-05-08': {
              name: {
                de: 'Tag der Befreiung (75. Jahrestag)',
                en: 'Liberation Day (75th Anniversary)'
              }
            }
          }
        },
        BW: {
          name: 'Baden-Württemberg',
          days: {
            '01-06': {
              _name: '01-06'
            },
            'easter -3': {
              _name: 'easter -3',
              type: 'school'
            },
            'easter 60': {
              _name: 'easter 60'
            },
            '10-31': {
              _name: 'Reformation Day',
              type: 'school'
            },
            '11-01': {
              _name: '11-01'
            }
          }
        },
        BY: {
          name: 'Bayern',
          days: {
            '01-06': {
              _name: '01-06'
            },
            '02-02': {
              _name: '02-02',
              type: 'observance'
            },
            'easter 60': {
              _name: 'easter 60'
            },
            '08-15': {
              _name: '08-15'
            },
            '11-01': {
              _name: '11-01'
            },
            'wednesday before 11-23': {
              _name: 'Buß- und Bettag',
              type: 'school'
            }
          },
          regions: {
            A: {
              name: 'Stadt Augsburg',
              days: {
                '08-08': {
                  name: {
                    de: 'Augsburger Friedensfest',
                    en: 'Augsburg Peace Festival'
                  }
                }
              }
            },
            EVANG: {
              names: {
                de: 'Überwiegend evangelische Gemeinden',
                en: 'Predominantly protestant communities'
              },
              days: {
                '08-15': {
                  _name: '08-15',
                  type: 'school'
                }
              }
            }
          }
        },
        HB: {
          name: 'Hansestadt Bremen',
          days: {
            '10-31': {
              _name: 'Reformation Day',
              active: [
                {
                  from: '2018-01-01T00:00:00.000Z'
                }
              ]
            }
          }
        },
        HE: {
          name: 'Hessen',
          days: {
            'easter 60': {
              _name: 'easter 60'
            }
          }
        },
        HH: {
          name: 'Hansestadt Hamburg',
          days: {
            '10-31': {
              _name: 'Reformation Day',
              active: [
                {
                  from: '2018-01-01T00:00:00.000Z'
                }
              ]
            }
          }
        },
        MV: {
          name: 'Mecklenburg Vorpommern',
          days: {
            '10-31': {
              _name: 'Reformation Day'
            }
          }
        },
        NI: {
          name: 'Niedersachsen',
          days: {
            '10-31': {
              _name: 'Reformation Day',
              active: [
                {
                  from: '2018-01-01T00:00:00.000Z'
                }
              ]
            }
          }
        },
        NW: {
          name: 'Nordrhein-Westfalen',
          days: {
            'easter 60': {
              _name: 'easter 60'
            },
            '11-01': {
              _name: '11-01'
            }
          }
        },
        RP: {
          name: 'Rheinland-Pfalz',
          days: {
            'easter 60': {
              _name: 'easter 60'
            },
            '11-01': {
              _name: '11-01'
            }
          }
        },
        SH: {
          name: 'Schleswig-Holstein',
          days: {
            '10-31': {
              _name: 'Reformation Day',
              active: [
                {
                  from: '2018-01-01T00:00:00.000Z'
                }
              ]
            }
          }
        },
        SL: {
          name: 'Saarland',
          days: {
            'easter 60': {
              _name: 'easter 60'
            },
            '08-15': {
              _name: '08-15'
            },
            '11-01': {
              _name: '11-01'
            }
          }
        },
        SN: {
          name: 'Sachsen',
          days: {
            'easter 60': {
              _name: 'easter 60',
              type: 'observance'
            },
            '10-31': {
              _name: 'Reformation Day'
            },
            'wednesday before 11-23': {
              _name: 'Buß- und Bettag'
            }
          },
          regions: {
            BZ: {
              name: 'Landkreis Bautzen',
              days: {
                'easter 60': {
                  _name: 'easter 60',
                  type: 'public',
                  note: 'Bautzen (nur in den Ortsteilen Bolbritz und Salzenforst), Crostwitz, Göda (nur im Ortsteil Prischwitz), Großdubrau (nur im Ortsteil Sdier), Hoyerswerda (nur im Ortsteil Dörgenhausen), Königswartha (nicht im Ortsteil Wartha), Nebelschütz, Neschwitz (nur in den Ortsteilen Neschwitz und Saritsch), Panschwitz-Kuckau, Puschwitz, Räckelwitz, Radibor, Ralbitz-Rosenthal und Wittichenau.'
                }
              }
            }
          }
        },
        ST: {
          name: 'Sachsen-Anhalt',
          days: {
            '01-06': {
              _name: '01-06'
            },
            '10-31': {
              _name: 'Reformation Day'
            }
          }
        },
        TH: {
          name: 'Thüringen',
          days: {
            'easter 60': {
              _name: 'easter 60',
              type: 'observance'
            },
            '09-20': {
              name: {
                de: 'Weltkindertag',
                en: "International Children's Day"
              },
              active: [
                {
                  from: 2019
                }
              ]
            },
            '10-31': {
              _name: 'Reformation Day'
            }
          },
          regions: {
            EIC: {
              name: 'Landkreis Eichfeld',
              days: {
                'easter 60': {
                  _name: 'easter 60',
                  type: 'public'
                }
              }
            },
            UH: {
              name: 'Unstrut-Hainich-Kreis',
              days: {
                'easter 60': {
                  _name: 'easter 60',
                  type: 'public',
                  note: 'In Anrode (nur in den Ortsteilen Bickenriede und Zella), Dünwald (nur in den Ortsteilen Beberstedt und Hüpstedt), Rodeberg (nur im Ortsteil Struth), Südeichsfeld'
                }
              }
            },
            WAK: {
              name: 'Wartburgkreis',
              days: {
                'easter 60': {
                  _name: 'easter 60',
                  type: 'public',
                  note: 'In Brunnhartshausen (nur in den Ortsteilen Föhlritz und Steinberg), Buttlar, Geisa, Schleid, Zella/Rhön'
                }
              }
            }
          }
        }
      }
    },
    DJ: {
      names: {
        fr: 'République de Djibouti',
        ar: 'جمهورية جيبوتي',
        so: 'Jamhuuriyadda Jabuuti',
        aa: 'Gabuutih Ummuuno',
        en: 'Djibouti'
      },
      langs: [
        'fr',
        'ar',
        'en'
      ],
      zones: [
        'Africa/Nairobi'
      ],
      dayoff: '',
      days: {
        '01-01': {
          _name: '01-01'
        },
        '05-01': {
          _name: '05-01'
        },
        '06-27 since 1977': {
          _name: 'Independence Day'
        },
        '12-25': {
          _name: '12-25'
        },
        '1 Muharram': {
          _name: '1 Muharram'
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal'
        },
        '27 Rajab': {
          _name: '27 Rajab'
        },
        '1 Shawwal': {
          _name: '1 Shawwal'
        },
        '9 Dhu al-Hijjah': {
          _name: '9 Dhu al-Hijjah'
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah'
        }
      }
    },
    DK: {
      names: {
        da: 'Danmark',
        en: 'Denmark'
      },
      langs: [
        'da'
      ],
      zones: [
        'Europe/Copenhagen'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        'easter -48': {
          name: {
            da: 'Fastelavn'
          },
          type: 'observance'
        },
        'easter -3': {
          _name: 'easter -3'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        'easter 26': {
          name: {
            da: 'Store Bededag',
            en: 'Prayer Day',
            de: 'Buß- und Bettag'
          }
        },
        'easter 39': {
          _name: 'easter 39'
        },
        '05-01': {
          _name: '05-01',
          type: 'observance',
          note: 'Full holiday for blue collar workers'
        },
        '2nd sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        '06-05': {
          _name: 'Constitution Day',
          type: 'observance',
          note: 'Shops are closed'
        },
        'easter 49': {
          _name: 'easter 49'
        },
        'easter 50': {
          _name: 'easter 50'
        },
        '12-24': {
          _name: '12-24',
          type: 'observance',
          note: 'Shops are closed'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        }
      }
    },
    DM: {
      names: {
        en: 'Dominica'
      },
      langs: [
        'en'
      ],
      zones: [
        'America/Port_of_Spain'
      ],
      dayoff: 'sunday',
      days: {
        '01-01 and if sunday then next monday': {
          _name: '01-01',
          substitute: true
        },
        'easter -48': {
          _name: 'easter -48',
          name: {
            en: 'Carnival Monday'
          }
        },
        'easter -47': {
          _name: 'easter -47',
          name: {
            en: 'Carnival Tuesday'
          }
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01'
        },
        'easter 49': {
          _name: 'easter 49',
          type: 'observance'
        },
        'easter 50': {
          _name: 'easter 50'
        },
        '1st monday in August': {
          name: {
            en: 'Emancipation Day'
          }
        },
        '11-03 if sunday then next monday': {
          _name: 'Independence Day'
        },
        '11-04 if sunday then next monday if monday then next tuesday': {
          name: {
            en: 'National Day of Community Service'
          }
        },
        '12-25 and if sunday then next tuesday': {
          _name: '12-25',
          substitute: true
        },
        '12-26 and if sunday then next monday': {
          _name: '12-26',
          substitute: true
        }
      }
    },
    DO: {
      names: {
        es: 'República Dominicana',
        en: 'Dominican Republic'
      },
      dayoff: 'sunday',
      zones: [
        'America/Santo_Domingo'
      ],
      langs: [
        'es'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-06 if tuesday,wednesday then previous monday if thursday,friday then next monday': {
          _name: '01-06'
        },
        '01-21': {
          name: {
            es: 'Nuestra Señora de la Altagracia',
            en: 'Our Lady of Altagracia'
          }
        },
        '01-26 if tuesday,wednesday then previous monday if thursday,friday then next monday': {
          name: {
            es: 'Día de Duarte',
            en: "Duarte's Birthday"
          }
        },
        '02-27': {
          _name: 'Independence Day'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        '05-01 if tuesday,wednesday then previous monday if thursday,friday,sunday then next monday': {
          _name: '05-01'
        },
        'easter 60': {
          _name: 'easter 60'
        },
        '08-16': {
          name: {
            es: 'Día de la Restauración',
            en: 'Restoration Day'
          }
        },
        '09-24': {
          name: {
            es: 'Nuestra Señora de las Mercedes',
            en: 'Our Lady of las Mercedes'
          }
        },
        '11-06 if tuesday,wednesday,thursday,friday,saturday then next monday': {
          _name: 'Constitution Day'
        },
        '12-25': {
          _name: '12-25'
        }
      }
    },
    DZ: {
      names: {
        ar: 'الجمهورية الجزائرية الديمقراطية الشعبية',
        fr: 'République algérienne démocratique et populaire',
        en: 'Algeria'
      },
      langs: [
        'ar',
        'fr',
        'en'
      ],
      zones: [
        'Africa/Algiers'
      ],
      dayoff: 'saturday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-12': {
          name: {
            ar: 'رأس السنة الأمازيغية',
            fr: 'Nouvel an amazigh',
            en: 'Amazigh New Year'
          }
        },
        '05-01': {
          _name: '05-01'
        },
        '07-05': {
          _name: 'Independence Day'
        },
        '11-01': {
          _name: 'Revolution Day'
        },
        '1 Muharram': {
          _name: '1 Muharram'
        },
        '10 Muharram': {
          _name: '10 Muharram'
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal'
        },
        '1 Shawwal': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah'
        }
      }
    },
    EC: {
      names: {
        es: 'Ecuador',
        en: 'Ecuador'
      },
      dayoff: 'sunday',
      langs: [
        'es'
      ],
      zones: [
        'America/Guayaquil',
        'Pacific/Galapagos'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        'easter -48': {
          name: {
            en: 'Carnival',
            es: 'Carnaval'
          }
        },
        'easter -47': {
          _name: 'easter -47'
        },
        'easter -3': {
          _name: 'easter -3'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        '05-01': {
          _name: '05-01'
        },
        '05-24': {
          name: {
            en: 'The Battle of Pichincha',
            es: 'Batalla del Pichincha'
          }
        },
        '07-24': {
          name: {
            en: 'The Birthday of Simón Bolívar',
            es: 'El Natalicio de Simón Bolívar'
          },
          type: 'observance'
        },
        '08-10': {
          name: {
            en: 'Declaration of Independence of Quito',
            es: 'Día del Primer Grito de Independencia de Quito'
          }
        },
        '09-10': {
          name: {
            en: 'Independence of Guayaquil',
            es: 'Independencia de Guayaquil'
          }
        },
        '10-31': {
          name: {
            en: 'Flag Day',
            es: 'Dia de La Bandera'
          },
          type: 'observance'
        },
        '11-02': {
          _name: '11-02'
        },
        '11-03': {
          name: {
            en: 'Independence of Cuenca',
            es: 'Independencia de Cuenca'
          }
        },
        '12-25': {
          _name: '12-25'
        },
        '12-31': {
          _name: '12-31',
          type: 'observance'
        }
      },
      states: {
        P: {
          name: 'Pichincha',
          regions: {
            QU: {
              name: 'Quito',
              days: {
                '12-06': {
                  name: {
                    en: 'Foundation of Quito',
                    es: 'Aniversario de la fundación de Quito'
                  },
                  type: 'observance'
                }
              }
            }
          }
        }
      }
    },
    EE: {
      names: {
        et: 'Eesti',
        en: 'Estonia'
      },
      dayoff: 'sunday',
      langs: [
        'et'
      ],
      zones: [
        'Europe/Tallinn'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-06': {
          _name: '01-06',
          type: 'observance'
        },
        '02-02': {
          name: {
            et: 'Tartu rahulepingu aastapäev',
            en: 'Anniversary of the Tartu Peace Treaty'
          },
          type: 'observance'
        },
        '02-24': {
          _name: 'Independence Day',
          type: 'public'
        },
        '03-14': {
          name: {
            et: 'emakeelepäev',
            en: 'Native Language Day'
          },
          type: 'observance'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter'
        },
        '05-01': {
          _name: '05-01'
        },
        '2nd sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        'easter 49': {
          _name: 'easter 49'
        },
        '06-04': {
          name: {
            et: 'Eesti lipu päev',
            en: 'National Flag Day'
          },
          type: 'observance'
        },
        '06-14': {
          name: {
            et: 'leinapäev',
            en: 'Day of Mourning and Commemoration'
          },
          type: 'observance'
        },
        '06-23': {
          name: {
            et: 'võidupüha',
            en: 'Victory Day'
          }
        },
        '06-24': {
          name: {
            et: 'jaanipäev',
            en: 'Midsummer Day'
          }
        },
        '08-20': {
          name: {
            et: 'taasiseseisvumispäev',
            en: 'Day of Restoration of Independence'
          }
        },
        '08-23': {
          name: {
            et: 'kommunismi ja natsismi ohvrite mälestuspäev',
            en: 'European Day of Remembrance for Victims of Stalinism and Nazism'
          },
          type: 'observance'
        },
        '2nd sunday in September': {
          name: {
            et: 'vanavanemate päev',
            en: 'Grandparents Day'
          },
          type: 'observance'
        },
        '09-22': {
          name: {
            et: 'vastupanuvõitluse päev',
            en: 'Resistance Fighting Day'
          },
          type: 'observance'
        },
        '11-02': {
          _name: '11-02',
          type: 'observance'
        },
        '2nd sunday in November': {
          _name: 'Fathers Day',
          type: 'observance'
        },
        '11-16': {
          name: {
            et: 'taassünni päev',
            en: 'Day of Declaration of Sovereignty'
          },
          type: 'observance'
        },
        '12-24': {
          _name: '12-24'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        }
      }
    },
    EG: {
      names: {
        ar: 'جمهورية مصر العربية',
        en: 'Egypt'
      },
      langs: [
        'ar',
        'en'
      ],
      zones: [
        'Africa/Cairo'
      ],
      dayoff: 'saturday',
      days: {
        '01-25 since 2011': {
          name: {
            ar: 'عيد ثورة 25 يناير',
            en: 'Revolution Day 2011'
          }
        },
        '01-25': {
          name: {
            ar: 'عيد الشرطة',
            en: 'National Police Day'
          }
        },
        '04-25': {
          name: {
            ar: 'عيد تحرير سيناء',
            en: 'Sinai Liberation Day'
          }
        },
        '05-01': {
          _name: '05-01'
        },
        '06-30': {
          name: {
            ar: 'عيد ثورة 30 يونيو',
            en: '30 June Day'
          }
        },
        '07-23': {
          _name: 'Revolution Day'
        },
        '10-06': {
          name: {
            ar: 'عيد القوات المسلحة',
            en: 'Armed Forces Day'
          }
        },
        'orthodox 1': {
          name: {
            ar: 'شم النسيم',
            en: 'Sham El Nessim'
          }
        },
        'julian 12-25': {
          _name: '12-25'
        },
        '1 Muharram': {
          _name: '1 Muharram'
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal'
        },
        '1 Shawwal P3D': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah P4D': {
          _name: '10 Dhu al-Hijjah'
        }
      }
    },
    EH: {
      names: {
        ar: 'الجمهورية العربية الصحراوية الديمقراطية',
        en: 'Western Sahara'
      },
      langs: [],
      zones: [
        'Africa/El_Aaiun'
      ],
      dayoff: '',
      days: {
        '02-27': {
          _name: 'Independence Day'
        },
        '03-08': {
          name: {
            en: 'First Martyr'
          }
        },
        '05-10': {
          name: {
            en: 'May 20 Revolution'
          }
        },
        '06-09': {
          name: {
            en: 'Day of the Martyrs'
          }
        },
        '06-17': {
          name: {
            en: 'Day of National Unity'
          }
        },
        '1 Muharram': {
          _name: '1 Muharram'
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal'
        },
        '1 Shawwal P2D': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah P2D': {
          _name: '10 Dhu al-Hijjah'
        }
      }
    },
    ER: {
      names: {
        en: 'Eritrea'
      },
      langs: [
        'ti',
        'en'
      ],
      zones: [
        'Africa/Nairobi'
      ],
      dayoff: '',
      days: {
        '01-01': {
          _name: '01-01'
        },
        'julian 12-25': {
          _name: 'julian 12-25'
        },
        'julian 01-06': {
          _name: '01-06'
        },
        '02-10': {
          name: {
            ti: 'ፈንቅል',
            en: 'Fenkil Day'
          }
        },
        '03-08': {
          _name: '03-08'
        },
        'orthodox -2': {
          _name: 'orthodox -2'
        },
        orthodox: {
          _name: 'orthodox'
        },
        '05-01': {
          _name: '05-01'
        },
        '05-24': {
          _name: 'Independence Day'
        },
        '06-20': {
          name: {
            en: "Martyrs' Day",
            ti: 'መዓልቲ ስውኣት'
          }
        },
        '09-01': {
          _name: 'Revolution Day'
        },
        '09-11 in non-leap years': {
          name: {
            en: 'Geez New Year',
            ti: 'ግዕዝ አዲስ ዓመት'
          }
        },
        '09-12 in leap years': {
          name: {
            en: 'Geez New Year',
            ti: 'ግዕዝ አዲስ ዓመት'
          }
        },
        '09-27 in non-leap years': {
          name: {
            en: 'Meskel'
          }
        },
        '09-28 in leap years': {
          name: {
            en: 'Meskel'
          }
        },
        '12-25': {
          _name: '12-25'
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal'
        },
        '1 Shawwal': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah'
        }
      }
    },
    ES: {
      names: {
        es: 'España',
        en: 'Spain'
      },
      langs: [
        'es'
      ],
      zones: [
        'Europe/Madrid',
        'Africa/Ceuta',
        'Atlantic/Canary'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        'substitutes 01-01 if sunday then next monday': {
          type: 'observance',
          substitute: true,
          _name: '01-01'
        },
        '01-06': {
          _name: '01-06'
        },
        'substitutes 01-06 if sunday then next monday': {
          type: 'observance',
          substitute: true,
          _name: '01-06'
        },
        '03-19': {
          _name: '03-19',
          type: 'observance'
        },
        'easter -3': {
          _name: 'easter -3',
          type: 'observance'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        '05-01': {
          _name: '05-01'
        },
        'substitutes 05-01 if sunday then next monday': {
          type: 'observance',
          substitute: true,
          _name: '05-01'
        },
        '1st sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        'easter 49': {
          _name: 'easter 49',
          type: 'observance'
        },
        '07-25': {
          name: {
            es: 'Santiago Apostol'
          },
          type: 'observance',
          note: 'regional'
        },
        '08-15': {
          _name: '08-15'
        },
        'substitutes 08-15 if sunday then next monday': {
          substitute: true,
          type: 'observance',
          _name: '08-15'
        },
        '10-12': {
          name: {
            es: 'Fiesta Nacional de España'
          }
        },
        'substitutes 10-12 if sunday then next monday': {
          substitute: true,
          type: 'observance',
          name: {
            es: 'Fiesta Nacional de España'
          }
        },
        '11-01': {
          _name: '11-01'
        },
        'substitutes 11-01 if sunday then next monday': {
          substitute: true,
          type: 'observance',
          _name: '11-01'
        },
        '12-06': {
          name: {
            es: 'Día de la Constitución Española'
          }
        },
        'substitutes 12-06 if sunday then next monday': {
          type: 'observance',
          substitute: true,
          name: {
            es: 'Día de la Constitución Española'
          }
        },
        '12-08': {
          _name: '12-08'
        },
        'substitutes 12-08 if sunday then next monday': {
          type: 'observance',
          substitute: true,
          _name: '12-08'
        },
        '12-25': {
          _name: '12-25'
        },
        'substitutes 12-25 if sunday then next monday': {
          type: 'observance',
          substitute: true,
          _name: '12-25'
        }
      },
      states: {
        MD: {
          name: 'Comunidad de Madrid',
          days: {
            '05-16': {
              name: {
                es: 'San Isidro Labrador'
              }
            },
            '11-09 if sunday then next monday': {
              name: {
                es: 'Nuestra Señora de la Almudena'
              }
            }
          }
        },
        AN: {
          name: 'Andalucía',
          days: {
            '02-28': {
              name: {
                es: 'Día de Andalucía'
              }
            }
          }
        },
        AR: {
          name: 'Aragón',
          days: {
            '04-23 if sunday then next monday': {
              name: {
                es: 'Día de Aragón'
              }
            }
          }
        },
        CT: {
          name: 'Catalonia',
          days: {
            '09-11': {
              name: {
                es: 'Diada de Catalunya'
              }
            },
            '06-24': {
              name: {
                es: 'Sant Joan'
              }
            },
            '09-24 if sunday then next monday': {
              name: {
                es: 'Mare de Déu de la Mercè'
              }
            },
            '12-26': {
              name: {
                es: 'Sant Esteve'
              }
            }
          }
        },
        CN: {
          names: {
            es: 'Islas Canarias',
            en: 'Canary Islands'
          },
          zones: [
            'Atlantic/Canary'
          ],
          dayoff: 'sunday',
          _days: 'IC',
          regions: {
            EH: {
              names: {
                es: 'El Hierro'
              },
              _days: [
                'IC',
                'regions',
                'EH'
              ]
            },
            FU: {
              names: {
                es: 'Fuerteventura'
              },
              _days: [
                'IC',
                'regions',
                'FU'
              ]
            },
            GC: {
              names: {
                es: 'Gran Canaria'
              },
              _days: [
                'IC',
                'regions',
                'GC'
              ]
            },
            LG: {
              names: {
                es: 'La Gomera'
              },
              _days: [
                'IC',
                'regions',
                'LG'
              ]
            },
            LP: {
              names: {
                es: 'La Palma'
              },
              _days: [
                'IC',
                'regions',
                'LP'
              ]
            },
            LA: {
              names: {
                es: 'Lanzarote'
              },
              _days: [
                'IC',
                'regions',
                'LA'
              ]
            },
            TE: {
              names: {
                es: 'Tenerife'
              },
              _days: [
                'IC',
                'regions',
                'TE'
              ]
            }
          }
        }
      }
    },
    ET: {
      names: {
        am: 'ኢትዮጵያ',
        en: 'Ethiopia'
      },
      dayoff: 'sunday',
      langs: [
        'am',
        'en'
      ],
      zones: [
        'Africa/Nairobi'
      ],
      days: {
        '01-06 in non-leap years': {
          _name: '12-25'
        },
        '01-07 in leap years': {
          _name: '12-25'
        },
        '01-19': {
          _name: '01-06'
        },
        '03-02': {
          name: {
            am: 'የዓድዋ ድል በዓል',
            en: 'Victory at Adwa Day'
          }
        },
        '03-28': {
          name: {
            am: 'የቀይ ሽብር መታሰቢያ ቀን',
            en: 'Day of Lament'
          }
        },
        'orthodox -2': {
          _name: 'easter -2'
        },
        orthodox: {
          _name: 'easter'
        },
        '05-28': {
          name: {
            am: 'ደርግ የወደቀበት ቀን',
            en: 'Derg Downfall Day'
          }
        },
        '09-11 in non-leap years': {
          _name: '01-01'
        },
        '09-12 in leap years': {
          _name: '01-01'
        },
        '09-27 in non-leap years': {
          name: {
            am: 'ብርሐነ-መስቀል',
            en: 'Finding of the True Cross'
          }
        },
        '09-28 in leap years': {
          name: {
            am: 'ብርሐነ-መስቀል',
            en: 'Finding of the True Cross'
          }
        },
        '1 Ramadan': {
          _name: '1 Ramadan'
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal'
        },
        '1 Shawwal': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah'
        }
      }
    },
    FI: {
      names: {
        fi: 'Suomi',
        en: 'Finland'
      },
      dayoff: 'sunday',
      langs: [
        'fi'
      ],
      zones: [
        'Europe/Helsinki'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-06': {
          _name: '01-06'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01'
        },
        'easter 39': {
          _name: 'easter 39'
        },
        'easter 49': {
          _name: 'easter 49'
        },
        '2nd sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        'friday after 06-19': {
          name: {
            fi: 'Juhannusaatto',
            en: 'Midsummer Eve',
            sv: 'Midsommarafton'
          },
          type: 'bank'
        },
        'saturday after 06-20': {
          name: {
            fi: 'Juhannuspäivä',
            en: 'Midsummer Day',
            sv: 'Midsommardagen'
          }
        },
        'saturday after 10-31': {
          _name: '11-01'
        },
        '2nd sunday in November': {
          _name: 'Fathers Day',
          type: 'observance'
        },
        '12-06': {
          _name: 'Independence Day'
        },
        '12-24': {
          _name: '12-24',
          type: 'bank'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        },
        '12-31 14:00 if sunday then 00:00': {
          _name: '12-31',
          type: 'bank'
        }
      }
    },
    FJ: {
      names: {
        fj: 'Matanitu Tugalala o Viti',
        en: 'Fiji'
      },
      langs: [
        'fj',
        'en'
      ],
      zones: [
        'Pacific/Fiji'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        'easter -1': {
          _name: 'easter -1'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '09-07': {
          _name: 'Constitution Day'
        },
        '10-10 and if Sunday then next Monday': {
          substitute: true,
          name: {
            en: 'Fiji Day'
          }
        },
        '12-25 if Sunday then next Monday': {
          _name: '12-25'
        },
        '12-26 if Sunday then next Monday if Monday then next Tuesday': {
          _name: '12-26'
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal'
        },
        '2014-10-22': {
          _name: 'Deepavali',
          name: {
            en: 'Diwali'
          }
        },
        '2015-11-10': {
          _name: 'Deepavali',
          name: {
            en: 'Diwali'
          }
        },
        '2016-10-29': {
          _name: 'Deepavali',
          name: {
            en: 'Diwali'
          }
        },
        '2017-10-19': {
          _name: 'Deepavali',
          name: {
            en: 'Diwali'
          }
        },
        '2018-11-07': {
          _name: 'Deepavali',
          name: {
            en: 'Diwali'
          }
        },
        '2019-10-27': {
          _name: 'Deepavali',
          name: {
            en: 'Diwali'
          }
        },
        '2019-10-28': {
          substitute: true,
          _name: 'Deepavali',
          name: {
            en: 'Diwali'
          }
        },
        '2020-11-14': {
          _name: 'Deepavali',
          name: {
            en: 'Diwali'
          }
        },
        '2020-11-16': {
          substitute: true,
          _name: 'Deepavali',
          name: {
            en: 'Diwali'
          }
        },
        '2021-11-04': {
          _name: 'Deepavali',
          name: {
            en: 'Diwali'
          }
        },
        '2022-10-24': {
          _name: 'Deepavali',
          name: {
            en: 'Diwali'
          }
        },
        '2023-11-12': {
          _name: 'Deepavali',
          name: {
            en: 'Diwali'
          }
        },
        '2023-11-13': {
          substitute: true,
          _name: 'Deepavali',
          name: {
            en: 'Diwali'
          }
        },
        '2024-11-01': {
          _name: 'Deepavali',
          name: {
            en: 'Diwali'
          }
        },
        '2025-10-21': {
          _name: 'Deepavali',
          name: {
            en: 'Diwali'
          }
        }
      }
    },
    FO: {
      names: {
        fo: 'Føroyar',
        da: 'Færøerne',
        en: 'Faroe Islands'
      },
      langs: [
        'fo',
        'da'
      ],
      zones: [
        'Atlantic/Faroe'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        'easter -3': {
          _name: 'easter -3'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '04-24': {
          name: {
            fo: 'Flaggdagur',
            da: 'Flagdag',
            en: 'Flag Day'
          }
        },
        'easter 26': {
          name: {
            fo: 'Dýri biðidagur',
            en: 'Great Prayer Day'
          }
        },
        'easter 39': {
          _name: 'easter 39'
        },
        'easter 49': {
          _name: 'easter 49'
        },
        'easter 50': {
          _name: 'easter 50'
        },
        '06-05 12:00 if sunday then 00:00': {
          _name: 'Constitution Day'
        },
        '07-28 12:00 if sunday then 00:00': {
          name: {
            da: 'Sankt Olavsaften',
            en: "St.Olav's Eve"
          },
          note: "half-day holiday for some workers' unions",
          type: 'observance'
        },
        '07-29': {
          name: {
            fo: 'Ólavsøka',
            da: 'Sankt Olavs Dag',
            en: "St.Olav's Day"
          },
          note: "full holiday for most workers' unions",
          type: 'observance'
        },
        '12-24': {
          _name: '12-24'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        },
        '12-31 12:00 if sunday then 00:00': {
          _name: '12-31'
        }
      }
    },
    FR: {
      names: {
        fr: 'France',
        en: 'France'
      },
      dayoff: 'sunday',
      zones: [
        'Europe/Paris'
      ],
      langs: [
        'fr'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01'
        },
        '05-08': {
          name: {
            fr: 'Fête de la Victoire 1945',
            en: 'Victory Day'
          }
        },
        'easter 39': {
          _name: 'easter 39'
        },
        'easter 49': {
          _name: 'easter 49',
          type: 'observance'
        },
        'easter 50': {
          _name: 'easter 50'
        },
        'sunday before 06-01': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        '07-14': {
          name: {
            fr: 'Fête Nationale de la France',
            en: 'Bastille Day'
          }
        },
        '08-15': {
          _name: '08-15'
        },
        '11-01': {
          _name: '11-01'
        },
        '11-11': {
          name: {
            fr: 'Armistice 1918',
            en: 'Armistice Day'
          }
        },
        '12-25': {
          _name: '12-25'
        }
      },
      states: {
        57: {
          name: 'Département Moselle',
          days: {
            'easter -2': {
              _name: 'easter -2'
            },
            '12-26': {
              _name: '12-26'
            }
          }
        },
        67: {
          name: 'Département Bas-Rhin',
          days: {
            'easter -2': {
              _name: 'easter -2'
            },
            '12-26': {
              _name: '12-26'
            }
          }
        },
        68: {
          name: 'Département Haut-Rhin',
          days: {
            'easter -2': {
              _name: 'easter -2'
            },
            '12-26': {
              _name: '12-26'
            }
          }
        },
        YT: {
          name: "Département et région d'outre-mer Mayotte",
          zones: [
            'Africa/Nairobi'
          ],
          _days: 'YT'
        },
        MQ: {
          name: "Département et région d'outre-mer Martinique",
          zones: [
            'America/Martinique'
          ],
          _days: 'MQ'
        },
        GP: {
          name: "Département et région d'outre-mer Guadeloupe",
          zones: [
            'America/Port_of_Spain'
          ],
          _days: 'GP'
        },
        GF: {
          name: "Département et région d'outre-mer Guyane",
          zones: [
            'America/Cayenne'
          ],
          _days: 'GF'
        },
        RE: {
          name: "Département et région d'outre-mer La Réunion",
          zones: [
            'Indian/Reunion'
          ],
          _days: 'RE'
        },
        MF: {
          name: "Département et région d'outre-mer Saint Martin",
          zones: [
            'America/Marigot'
          ],
          _days: 'MF'
        },
        BL: {
          name: "Département et région d'outre-mer Saint Barthélemy",
          zones: [
            'America/St_Barthelemy'
          ],
          _days: 'BL'
        }
      }
    },
    GA: {
      names: {
        fr: 'Gabon',
        en: 'Gabon'
      },
      dayoff: 'sunday',
      langs: [
        'fr'
      ],
      zones: [
        'Africa/Lagos'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '04-17': {
          name: {
            fr: 'Journée des droits de la femme',
            en: "Women's Day"
          }
        },
        '05-01': {
          _name: '05-01'
        },
        'easter 50': {
          _name: 'easter 50'
        },
        '08-15': {
          _name: '08-15'
        },
        '08-16 P2D': {
          _name: 'Independence Day'
        },
        '11-01': {
          _name: '11-01'
        },
        '12-25': {
          _name: '12-25'
        },
        '1 Shawwal': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah'
        }
      }
    },
    GB: {
      names: {
        en: 'United Kingdom'
      },
      dayoff: 'sunday',
      zones: [
        'Europe/London'
      ],
      langs: [
        'en'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        'substitutes 01-01 if sunday then next monday': {
          substitute: true,
          _name: '01-01'
        },
        'substitutes 01-01 if saturday then next monday': {
          substitute: true,
          _name: '01-01'
        },
        'easter -21': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '1st monday in May': {
          name: {
            en: 'Early May bank holiday'
          },
          disable: [
            '2020-05-04'
          ]
        },
        '1st monday before 06-01': {
          name: {
            en: 'Spring bank holiday'
          },
          disable: [
            '2022-05-30'
          ],
          enable: [
            '2022-06-02'
          ]
        },
        '12-25': {
          _name: '12-25'
        },
        'substitutes 12-25 if saturday then next monday if sunday then next tuesday': {
          substitute: true,
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        },
        'substitutes 12-26 if saturday then next monday if sunday then next tuesday': {
          substitute: true,
          _name: '12-26'
        },
        '2012-06-05': {
          name: {
            en: 'Queen’s Diamond Jubilee'
          }
        },
        '2020-05-08': {
          name: {
            en: 'Early May bank holiday (VE day)'
          }
        },
        '2022-06-03': {
          name: {
            en: 'Queen’s Platinum Jubilee'
          }
        },
        '3rd sunday in June': {
          _name: 'Fathers Day',
          type: 'observance'
        }
      },
      states: {
        ALD: {
          name: 'Alderney',
          zones: [
            'Europe/Guernsey'
          ],
          days: {
            '12-15': {
              name: {
                en: 'Homecoming Day'
              }
            }
          }
        },
        ENG: {
          name: 'England',
          days: {
            '1st monday before 09-01': {
              name: {
                en: 'Summer bank holiday'
              }
            }
          }
        },
        NIR: {
          name: 'Northern Ireland',
          zones: [
            'Europe/Belfast'
          ],
          days: {
            '03-17': {
              name: {
                en: "St Patrick's Day"
              }
            },
            'substitutes 03-17 if saturday then next monday': {
              substitute: true,
              name: {
                en: "St Patrick's Day"
              }
            },
            'substitutes 03-17 if sunday then next monday': {
              substitute: true,
              name: {
                en: "St Patrick's Day"
              }
            },
            '07-12': {
              name: {
                en: 'Battle of the Boyne, Orangemen’s Day'
              }
            },
            'substitutes 07-12 if saturday then next monday': {
              substitute: true,
              name: {
                en: 'Battle of the Boyne'
              }
            },
            'substitutes 07-12 if sunday then next monday': {
              substitute: true,
              name: {
                en: 'Battle of the Boyne'
              }
            },
            '1st monday before 09-01': {
              name: {
                en: 'Summer bank holiday'
              }
            }
          }
        },
        SCT: {
          name: 'Scotland',
          days: {
            'substitutes 01-01 if sunday then next monday': false,
            'substitutes 01-01 if saturday then next monday': false,
            'substitutes 01-01 if saturday then next tuesday': {
              substitute: true,
              _name: '01-01'
            },
            'substitutes 01-01 if sunday then next tuesday': {
              substitute: true,
              _name: '01-01'
            },
            '01-02': {
              name: {
                en: 'Januar 2nd'
              }
            },
            'substitutes 01-02 if saturday then next monday': {
              substitute: true,
              name: {
                en: 'Januar 2nd'
              }
            },
            'substitutes 01-02 if sunday then next monday': {
              substitute: true,
              name: {
                en: 'Januar 2nd'
              }
            },
            'easter 1': {
              _name: 'easter 1'
            },
            '1st monday in August': {
              name: {
                en: 'Summer bank holiday'
              }
            },
            '11-30': {
              name: {
                en: 'St Andrew’s Day'
              }
            }
          }
        },
        WLS: {
          name: 'Wales',
          days: {
            '1st monday before 09-01': {
              name: {
                en: 'Summer bank holiday'
              }
            }
          },
          regions: {}
        }
      }
    },
    GD: {
      names: {
        en: 'Grenada'
      },
      dayoff: 'sunday',
      langs: [
        'en'
      ],
      zones: [
        'America/Port_of_Spain'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '02-07': {
          _name: 'Independence Day'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '04-24 P3D': {
          name: {
            en: 'Carriacou Maroon and String Band Music Festival'
          },
          type: 'observance'
        },
        '05-01': {
          _name: '05-01'
        },
        'easter 49': {
          _name: 'easter 49',
          type: 'observance'
        },
        'easter 50': {
          _name: 'easter 50'
        },
        'easter 60': {
          _name: 'easter 60'
        },
        '1st monday in August': {
          name: {
            en: 'Emancipation Day'
          }
        },
        '2nd monday in August': {
          name: {
            en: 'Carnival Monday'
          }
        },
        'tuesday after 2nd monday in August': {
          name: {
            en: 'Carnival Tuesday'
          }
        },
        '09-01': {
          name: {
            en: 'Kirani Day'
          },
          type: 'observance'
        },
        '10-15 P5D': {
          name: {
            en: 'Aunty Tek Spice Word Festival'
          },
          type: 'observance'
        },
        '10-25': {
          name: {
            en: 'Thanksgiving Day'
          }
        },
        '12-04 P3D': {
          name: {
            en: 'Camerhogne Folk Festival'
          },
          type: 'observance'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        }
      }
    },
    GE: {
      names: {
        ge: 'საქართველო',
        en: 'Georgia'
      },
      langs: [
        'ge'
      ],
      zones: [
        'Asia/Tbilisi'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-02': {
          name: {
            ge: 'ბედობა',
            en: 'Bedoba'
          }
        },
        '01-07': {
          name: {
            ge: 'შობა',
            en: 'Orthodox Christmas'
          }
        },
        '01-19': {
          name: {
            ge: 'ნათლისღება',
            en: 'Orthodox Epiphany'
          }
        },
        '03-03': {
          name: {
            ge: 'დედის დღე',
            en: "Mother's Day"
          }
        },
        '03-08': {
          _name: '03-08'
        },
        '04-09': {
          name: {
            ge: 'ეროვნული ერთიანობის დღე',
            en: 'National Unity Day'
          }
        },
        'orthodox -2': {
          _name: 'easter -2'
        },
        'orthodox -1': {
          _name: 'easter -1'
        },
        orthodox: {
          _name: 'easter'
        },
        'orthodox 1': {
          _name: 'easter 1'
        },
        '05-09': {
          name: {
            ge: 'ფაშიზმზე გამარჯვების დღე',
            en: 'Victory Day'
          }
        },
        '05-12': {
          name: {
            ge: 'წმინდა ანდრია პირველწოდებულის ხსენების დღე',
            en: 'Saint Andrew the First-Called Day'
          }
        },
        '05-26': {
          name: {
            ge: 'დამოუკიდებლობის დღე',
            en: 'Independence Day'
          }
        },
        '08-28': {
          name: {
            ge: 'მარიამობა',
            en: "Saint Mary's Day"
          }
        },
        '10-14': {
          name: {
            ge: 'სვეტიცხოვლობა',
            en: 'Svetitskhovloba'
          }
        },
        '11-23': {
          name: {
            ge: 'გიორგობა',
            en: "Saint George's Day"
          }
        }
      }
    },
    GF: {
      names: {
        fr: 'Guyane',
        en: 'French Guiana'
      },
      langs: [
        'fr'
      ],
      zones: [
        'America/Cayenne'
      ],
      dayoff: 'sunday',
      _days: 'FR',
      days: {
        '06-10': {
          _name: 'Abolition of Slavery'
        }
      }
    },
    GG: {
      names: {
        en: 'Guernsey'
      },
      dayoff: 'sunday',
      zones: [
        'Europe/Guernsey'
      ],
      langs: [
        'en'
      ],
      _days: [
        'GB'
      ],
      days: {
        '05-09': {
          name: {
            en: 'Liberation Day'
          }
        }
      }
    },
    GH: {
      names: {
        en: 'Ghana'
      },
      langs: [
        'en'
      ],
      zones: [
        'Africa/Accra'
      ],
      dayoff: '',
      days: {
        '01-01 and if Saturday, Sunday then next Monday': {
          substitute: true,
          _name: '01-01'
        },
        '01-07 since 2019': {
          _name: 'Constitution Day'
        },
        '03-06 and if Saturday, Sunday then next Monday': {
          substitute: true,
          _name: 'Independence Day'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01 and if Saturday, Sunday then next Monday': {
          substitute: true,
          _name: '05-01'
        },
        '08-04 and if Saturday, Sunday then next Monday': {
          substitute: true,
          name: {
            en: 'Founders Day'
          }
        },
        '09-21 and if Saturday, Sunday then next Monday': {
          substitute: true,
          name: {
            en: 'Kwame Nkrumah Memorial Day'
          }
        },
        '1st Friday in December since 1988': {
          name: {
            en: 'Farmers Day'
          }
        },
        '12-25 and if Saturday then next Monday if Sunday then next Tuesday': {
          substitute: true,
          _name: '12-25'
        },
        '12-26 and if Saturday then next Monday if Sunday then next Tuesday': {
          substitute: true,
          _name: '12-26'
        },
        '1 Shawwal and if Saturday, Sunday then next Monday': {
          substitute: true,
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah and if Saturday, Sunday then next Monday': {
          substitute: true,
          _name: '10 Dhu al-Hijjah'
        }
      }
    },
    GI: {
      names: {
        en: 'Gibraltar'
      },
      langs: [
        'en'
      ],
      zones: [
        'Europe/Gibraltar'
      ],
      dayoff: 'sunday',
      _days: 'GB',
      days: {
        '2nd monday in March': {
          name: {
            en: 'Commonwealth Day'
          }
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        '04-28': {
          name: {
            en: 'Workers Memorial Day'
          },
          disable: [
            '2015-04-28'
          ],
          enable: [
            '2015-04-27'
          ]
        },
        '05-01 if sunday, saturday then next monday': {
          substitute: true,
          name: {
            en: 'May Day'
          }
        },
        '1st monday in May': false,
        '2020-05-08': {
          name: {
            en: 'Victory in Europe Day (VE Day)'
          }
        },
        'monday before 06-20': {
          name: {
            en: "Queen's Birthday"
          }
        },
        'monday before September': {
          name: {
            en: 'Late Summer Bank Holiday'
          }
        },
        '09-10': {
          name: {
            en: 'Gibraltar National Day'
          },
          active: [
            {
              to: 2015
            }
          ]
        },
        '09-10 and if sunday, saturday then previous monday': {
          substitute: true,
          name: {
            en: 'Gibraltar National Day'
          },
          active: [
            {
              from: 2015
            }
          ]
        }
      }
    },
    GL: {
      names: {
        kl: 'Kalaallit Nunaat',
        da: 'Grønland',
        en: 'Greenland'
      },
      langs: [
        'kl',
        'da'
      ],
      zones: [
        'America/Godthab',
        'America/Danmarkshavn',
        'America/Scoresbysund',
        'America/Thule'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-06': {
          _name: '01-06'
        },
        'easter -3': {
          _name: 'easter -3'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        'easter 26': {
          name: {
            kl: 'tussiarfissuaq',
            da: 'Store Bededag',
            en: 'Prayer Day'
          }
        },
        'easter 39': {
          _name: 'easter 39'
        },
        '06-21': {
          name: {
            kl: 'ullortuneq',
            da: 'Nationaldag',
            en: 'National Day'
          }
        },
        'easter 49': {
          _name: 'easter 49'
        },
        'easter 50': {
          _name: 'easter 50'
        },
        '12-24': {
          _name: '12-24'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        }
      }
    },
    GM: {
      names: {
        en: 'The Gambia'
      },
      langs: [
        'en'
      ],
      zones: [
        'Africa/Abidjan'
      ],
      dayoff: '',
      days: {
        '01-01': {
          _name: '01-01'
        },
        '02-18': {
          _name: 'Independence Day'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01'
        },
        '05-25': {
          name: {
            en: 'Africa Day'
          }
        },
        '07-22': {
          name: {
            en: 'Revolution Day'
          }
        },
        '08-15': {
          _name: '08-15'
        },
        '12-25': {
          _name: '12-25'
        },
        '10 Muharram': {
          _name: '10 Muharram'
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal'
        },
        '23 Ramadan': {
          _name: '23 Ramadan'
        },
        '1 Shawwal': {
          _name: '1 Shawwal',
          name: {
            en: 'Korité'
          }
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah',
          name: {
            en: 'Tabaski'
          }
        }
      }
    },
    GN: {
      names: {
        fr: 'Guinée',
        en: 'Guinea'
      },
      langs: [
        'fr'
      ],
      zones: [
        'Africa/Abidjan'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '04-03': {
          name: {
            fr: 'Fête Nationale de la deuxième République',
            en: 'National Holiday'
          }
        },
        '05-01': {
          _name: '05-01'
        },
        '05-25': {
          name: {
            fr: "Anniversaire de l'Organisation de l'unité africaine (OUA)",
            en: 'Africa Day'
          }
        },
        '27 Ramadan': {
          _name: '27 Ramadan'
        },
        '1 Shawwal': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah'
        },
        '08-15': {
          _name: '08-15'
        },
        '10-02': {
          _name: 'Independence Day'
        },
        '12-25': {
          _name: '12-25'
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal'
        }
      }
    },
    GP: {
      names: {
        fr: 'Guadeloupe',
        en: 'Guadeloupe'
      },
      langs: [
        'fr'
      ],
      zones: [
        'America/Port_of_Spain'
      ],
      dayoff: 'sunday',
      _days: 'FR',
      days: {
        'easter 49': false,
        'easter -2': {
          _name: 'easter -2'
        },
        '05-27': {
          _name: 'Abolition of Slavery'
        },
        '07-21': {
          name: {
            fr: 'Jour de Victor Shoelcher',
            en: 'Victor Shoelcher Day'
          }
        }
      }
    },
    GQ: {
      names: {
        es: 'República de Guinea Ecuatorial',
        fr: 'République de Guinée équatoriale',
        pt: 'República da Guiné Equatorial',
        en: 'Republic of Equatorial Guinea'
      },
      dayoff: 'sunday',
      weekend: [
        'saturday',
        'sunday'
      ],
      langs: [
        'es',
        'fr',
        'pt'
      ],
      zones: [
        'Africa/Lagos'
      ],
      days: {
        '01-01 and if sunday then next monday': {
          substitute: true,
          _name: '01-01'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        '05-01 and if sunday then next monday': {
          substitute: true,
          _name: '05-01'
        },
        'easter 60': {
          _name: 'easter 60'
        },
        '06-05 and if sunday then next monday': {
          substitute: true,
          name: {
            es: 'Natalicio de Teodoro Obiang',
            en: "President's Day"
          }
        },
        '08-03 and if sunday then next monday': {
          substitute: true,
          name: {
            es: 'Día del Golpe de Libertad',
            en: 'Armed Forces Day'
          }
        },
        '08-15 and if sunday then next monday': {
          substitute: true,
          _name: 'Constitution Day'
        },
        '10-12 and if sunday then next monday': {
          substitute: true,
          _name: 'Independence Day'
        },
        '12-08 and if sunday then next monday': {
          substitute: true,
          _name: '12-08'
        },
        '12-25 and if sunday then next monday': {
          substitute: true,
          _name: '12-25'
        }
      }
    },
    GR: {
      names: {
        el: 'Ελλάδα',
        en: 'Greece'
      },
      dayoff: 'sunday',
      zones: [
        'Europe/Athens'
      ],
      langs: [
        'el'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-06': {
          _name: '01-06'
        },
        'orthodox -48': {
          name: {
            el: 'Καθαρά Δευτέρα',
            en: 'Ash Sunday'
          }
        },
        '03-25': {
          name: {
            el: 'Ευαγγελισμός, Εθνική Εορτή',
            en: 'Annunciation, Anniversary of 1821 Revolution'
          }
        },
        'orthodox -2': {
          _name: 'easter -2'
        },
        orthodox: {
          _name: 'easter'
        },
        'orthodox 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01'
        },
        'orthodox 49': {
          _name: 'easter 49'
        },
        'orthodox 50': {
          _name: 'easter 50'
        },
        '2nd sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        '08-15': {
          _name: '08-15'
        },
        '10-28': {
          _name: 'National Holiday',
          name: {
            el: 'Επέτειος του Όχι'
          }
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        }
      }
    },
    GT: {
      names: {
        es: 'Guatemala',
        en: 'Guatemala'
      },
      dayoff: 'sunday',
      langs: [
        'es'
      ],
      zones: [
        'America/Guatemala'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        'easter -3': {
          _name: 'easter -3'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        'easter -1': {
          _name: 'easter -1'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        '05-01': {
          _name: '05-01'
        },
        '06-30 if tuesday then previous monday if wednesday,thursday then next friday': {
          name: {
            es: 'Día de las Fuerzas Armadas',
            en: 'Army Day'
          }
        },
        '09-15': {
          _name: 'Independence Day'
        },
        '10-20': {
          _name: 'Revolution Day'
        },
        '11-01': {
          _name: '11-01'
        },
        '12-24 12:00': {
          _name: '12-24'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-31 12:00': {
          _name: '12-31'
        }
      }
    },
    GU: {
      names: {
        en: 'Guam'
      },
      dayoff: 'sunday',
      langs: [
        'en-us',
        'en'
      ],
      zones: [
        'Pacific/Guam'
      ],
      _days: [
        'US'
      ],
      days: {
        '3rd monday in February': false,
        '03-17': false,
        '1st monday in March': {
          name: {
            en: 'Guam History and Chamorro Heritage Day'
          }
        },
        'easter -2': {
          _name: 'easter -2',
          type: 'observance'
        },
        '07-21 if sunday then next monday': {
          name: {
            en: 'Liberation Day'
          }
        },
        '11-02': {
          _name: '11-02'
        },
        '12-08 if sunday then next monday': {
          name: {
            en: 'Our Lady of Camarin Day'
          }
        }
      }
    },
    GW: {
      names: {
        pt: 'Guiné-Bissau',
        en: 'Guinea-Bissau'
      },
      langs: [
        'pt'
      ],
      zones: [
        'Africa/Bissau'
      ],
      dayoff: '',
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-20': {
          name: {
            pt: 'Dia dos heróis',
            en: 'Heroes Day'
          }
        },
        '03-08': {
          _name: '03-08'
        },
        '05-01': {
          _name: '05-01'
        },
        '08-03': {
          name: {
            pt: 'Pidjiguiti Day'
          }
        },
        '09-24': {
          _name: 'Independence Day'
        },
        '11-14': {
          name: {
            pt: 'Dia do Movimento de Reajustamento',
            en: 'Readjustment Movement Day'
          }
        },
        '12-25': {
          _name: '12-25'
        },
        '1 Shawwal': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah'
        }
      }
    },
    GY: {
      names: {
        en: 'Guyana'
      },
      coord: {
        lat: 6.8045,
        lng: -58.1553
      },
      dayoff: 'sunday',
      langs: [
        'en'
      ],
      zones: [
        'America/Guyana'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '02-23': {
          name: {
            en: 'Republic Day'
          }
        },
        'easter -2': {
          _name: 'easter -2'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01'
        },
        '05-05': {
          name: {
            en: 'Arrival Day'
          }
        },
        '05-26': {
          _name: 'Independence Day'
        },
        'monday after 07-01': {
          name: {
            en: 'CARICOM Day'
          }
        },
        '08-01': {
          name: {
            en: 'Emancipation Day'
          }
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal',
          name: {
            en: 'Youman Nabi'
          },
          note: 'tentative',
          disable: [
            '2016-12-11',
            '2015-12-23',
            '2013-01-24'
          ],
          enable: [
            '2016-12-12',
            '2015-12-24',
            '2013-01-23'
          ]
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah',
          name: {
            en: 'Eid Ul Adha'
          },
          note: 'tentative',
          disable: [
            '2015-09-23'
          ],
          enable: [
            '2015-09-24'
          ]
        },
        '2015-03-05': {
          name: {
            en: 'Phagwah'
          }
        },
        '2016-03-23': {
          name: {
            en: 'Phagwah'
          }
        },
        '2017-03-12': {
          name: {
            en: 'Phagwah'
          }
        },
        '2017-03-13': {
          substitute: true,
          name: {
            en: 'Phagwah'
          }
        },
        '2018-03-02': {
          name: {
            en: 'Phagwah'
          }
        },
        '2019-03-21': {
          name: {
            en: 'Phagwah'
          }
        },
        '2020-03-10': {
          name: {
            en: 'Phagwah'
          }
        },
        '2021-03-29': {
          name: {
            en: 'Phagwah'
          }
        },
        '2022-03-18': {
          name: {
            en: 'Phagwah'
          }
        },
        '2023-03-07': {
          name: {
            en: 'Phagwah'
          }
        },
        '2024-03-25': {
          name: {
            en: 'Phagwah'
          }
        },
        '2015-11-11': {
          name: {
            en: 'Deepavali'
          }
        },
        '2017-10-18': {
          name: {
            en: 'Deepavali'
          }
        },
        '2018-11-07': {
          name: {
            en: 'Deepavali'
          }
        },
        '2019-10-27': {
          name: {
            en: 'Deepavali'
          }
        },
        '2019-10-28': {
          substitute: true,
          name: {
            en: 'Deepavali'
          }
        },
        '2020-11-14': {
          name: {
            en: 'Deepavali'
          }
        },
        '2021-11-04': {
          name: {
            en: 'Deepavali'
          }
        },
        '2022-10-24': {
          name: {
            en: 'Deepavali'
          }
        },
        '2023-11-12': {
          name: {
            en: 'Deepavali'
          }
        },
        '2023-11-13': {
          substitute: true,
          name: {
            en: 'Deepavali'
          }
        },
        '2024-10-31': {
          name: {
            en: 'Deepavali'
          }
        }
      }
    },
    HK: {
      names: {
        zh: '香港',
        en: 'Hong Kong'
      },
      langs: [
        'zh',
        'en'
      ],
      zones: [
        'Asia/Hong_Kong'
      ],
      dayoff: 'sunday',
      days: {
        '01-01 and if Sunday then next Monday': {
          substitute: true,
          _name: '01-01',
          name: {
            zh: '一月一日'
          }
        },
        'chinese 01-0-01 and if Saturday then next Tuesday': {
          name: {
            en: 'Lunar New Year',
            zh: '農曆年初一'
          }
        },
        'chinese 01-0-02 and if Saturday then next Monday': {
          name: {
            en: 'The second day of the Lunar New Year',
            zh: '農曆年初二'
          }
        },
        'chinese 01-0-03 and if Saturday then next Monday': {
          name: {
            en: 'The third day of the Lunar New Year',
            zh: '農曆年初三'
          }
        },
        'chinese 5-01 solarterm and if Sunday then next Monday': {
          name: {
            en: 'Qingming Festival',
            zh: '清明節'
          }
        },
        'easter -2': {
          _name: 'easter -2'
        },
        'easter -1': {
          _name: 'easter -1'
        },
        easter: {
          _name: 'easter'
        },
        'easter 1': {
          _name: 'easter 1',
          disable: [
            '2021-04-05'
          ],
          enable: [
            '2021-04-06'
          ]
        },
        '05-01 and if Sunday then next Monday': {
          substitute: true,
          _name: '05-01'
        },
        'chinese 04-0-08 and if Sunday then next Monday': {
          name: {
            en: 'Birthday of the Buddha',
            zh: '佛誕'
          }
        },
        'chinese 05-0-05': {
          name: {
            en: 'Dragon Boat Festival',
            zh: '端午节'
          }
        },
        '07-01 and if Sunday then next Monday': {
          substitute: true,
          name: {
            en: 'Hong Kong Special Administrative Region Establishment Day',
            zh: '香港特別行政區成立紀念日'
          }
        },
        'chinese 08-0-16 and if Sunday then next Monday if is public holiday then next day omit Saturday, Sunday': {
          substitute: true,
          name: {
            en: 'The day following the Chinese Mid-Autumn Festival',
            zh: '中秋節翌日'
          }
        },
        '10-01 and if Sunday then next Monday': {
          substitute: true,
          name: {
            en: 'National Day',
            zh: '國慶日'
          }
        },
        'chinese 09-0-09 and if Sunday then next Monday': {
          substitute: true,
          name: {
            en: 'Chung Yeung Festival',
            zh: '重阳节'
          }
        },
        '12-25 and if Sunday then next Monday': {
          substitute: true,
          _name: '12-25'
        },
        '12-26 and if Sunday then next Monday if Monday then next Tuesday': {
          substitute: true,
          name: {
            en: 'The first weekday after Christmas Day',
            zh: '圣诞节后的第一个工作日'
          }
        }
      }
    },
    HN: {
      names: {
        es: 'Honduras',
        en: 'Honduras'
      },
      dayoff: 'sunday',
      langs: [
        'es'
      ],
      zones: [
        'America/Tegucigalpa'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '03-19': {
          _name: 'Fathers Day',
          type: 'observance'
        },
        'easter -3': {
          _name: 'easter -3'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        '04-14': {
          name: {
            es: 'Día de las Américas'
          }
        },
        '05-01': {
          _name: '05-01'
        },
        '2nd monday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        '06-11': {
          name: {
            en: "Pupil's Day",
            es: 'Día del Estudiante'
          },
          type: 'observance'
        },
        '09-10': {
          name: {
            en: "Children's Day",
            es: 'Día del Niño'
          },
          type: 'observance'
        },
        '09-15': {
          _name: 'Independence Day'
        },
        '09-17': {
          name: {
            en: "Teacher's Day",
            es: 'Día del Maestro'
          },
          type: 'observance'
        },
        '10-03': {
          name: {
            en: "Soldier's Day",
            es: 'Día del Soldado'
          }
        },
        '10-12': {
          name: {
            es: 'Día de la Raza',
            en: 'Columbus Day'
          }
        },
        '10-21': {
          name: {
            es: 'Día de las Fuerzas Armadas',
            en: 'Armed forces Day'
          }
        },
        '12-25': {
          _name: '12-25'
        }
      }
    },
    HR: {
      names: {
        hr: 'Hrvatska',
        en: 'Croatia'
      },
      langs: [
        'hr'
      ],
      zones: [
        'Europe/Belgrade'
      ],
      days: {
        '01-01': {
          _name: '01-01',
          type: 'public'
        },
        '01-06': {
          _name: '01-06',
          type: 'public'
        },
        'easter -47': {
          _name: 'easter -47',
          type: 'observance'
        },
        easter: {
          _name: 'easter',
          type: 'public'
        },
        'easter 1': {
          _name: 'easter 1',
          type: 'public'
        },
        'easter 60': {
          _name: 'easter 60',
          type: 'public'
        },
        '03-08': {
          _name: '03-08',
          type: 'observance'
        },
        '05-01': {
          _name: '05-01',
          type: 'public'
        },
        '05-30': {
          name: {
            hr: 'Dan državnosti',
            en: 'National Day'
          },
          type: 'public',
          active: [
            {
              from: '2020-01-01'
            }
          ]
        },
        '2nd sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        '06-22': {
          name: {
            hr: 'Dan antifašističke borbe',
            en: 'Anti-Fascist Struggle Day'
          },
          type: 'public'
        },
        '06-25 #1': {
          name: {
            hr: 'Dan državnosti',
            en: 'Statehood Day'
          },
          type: 'public',
          active: [
            {
              to: '2020-01-01'
            }
          ]
        },
        '06-25': {
          name: {
            hr: 'Dan neovisnosti',
            en: 'Independence Day'
          },
          type: 'observance',
          active: [
            {
              from: '2020-01-01'
            }
          ]
        },
        '08-05': {
          name: {
            hr: 'Dan pobjede i domovinske zahvalnosti i Dan hrvatskih branitelja',
            en: 'Victory and Homeland Thanksgiving Day and the Day of Croatian defenders'
          },
          type: 'public'
        },
        '08-15': {
          _name: '08-15',
          type: 'public'
        },
        '10-08 #1': {
          name: {
            hr: 'Dan neovisnosti',
            en: 'Independence Day'
          },
          type: 'public',
          active: [
            {
              to: '2020-01-01'
            }
          ]
        },
        '10-08': {
          name: {
            hr: 'Dan Hrvatskoga sabora',
            en: 'Day of the Croatian Parliament'
          },
          type: 'observence',
          active: [
            {
              from: '2020-01-01'
            }
          ]
        },
        '11-01': {
          _name: '11-01',
          type: 'public'
        },
        '11-18 #1': {
          name: {
            hr: 'Dan sjećanja na žrtvu Vukovara i Škabrnje',
            en: 'Remembrance Day'
          },
          type: 'observance',
          active: [
            {
              to: '2020-01-01'
            }
          ]
        },
        '11-18': {
          name: {
            hr: 'Dan sjećanja na žrtve Domovinskog rata i Dan sjećanja na žrtvu Vukovara i Škabrnje',
            en: 'Remembrance Day'
          },
          type: 'public',
          active: [
            {
              from: '2020-01-01'
            }
          ]
        },
        '12-25': {
          _name: '12-25',
          type: 'public'
        },
        '12-26': {
          _name: '12-26',
          type: 'public'
        },
        orthodox: {
          _name: 'orthodox',
          type: 'optional',
          note: 'Orthodox believers (legally defined as Christians who follow the Julian Calender)'
        },
        'orthodox 1': {
          _name: 'orthodox 1',
          type: 'optional',
          note: 'Orthodox believers (legally defined as Christians who follow the Julian Calender)'
        },
        'julian 12-25': {
          _name: 'julian 12-25',
          type: 'optional',
          note: 'Orthodox believers (legally defined as Christians who follow the Julian Calender)'
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah',
          type: 'optional',
          note: 'Muslim believers'
        },
        '1 Shawwal': {
          _name: '1 Shawwal',
          type: 'optional',
          note: 'Muslim believers'
        },
        '1 Tishrei': {
          _name: '10 Tishrei',
          type: 'optional',
          note: 'Jewish believers'
        },
        '10 Tishrei': {
          _name: '10 Tishrei',
          type: 'optional',
          note: 'Jewish believers'
        }
      },
      regions: {
        17: {
          name: 'Split-Dalmatia',
          days: {
            '05-07': {
              name: {
                hr: 'Sveti Duje',
                en: 'Saint Domnius'
              },
              type: 'optional'
            }
          }
        },
        19: {
          name: 'Dubrovnik-Neretva',
          days: {
            '02-03': {
              name: {
                hr: 'Sveti Vlaho',
                en: 'Saint Blaise'
              },
              type: 'optional'
            }
          }
        }
      }
    },
    HT: {
      names: {
        fr: 'Haïti',
        en: 'Haiti'
      },
      dayoff: 'sunday',
      langs: [
        'fr'
      ],
      zones: [
        'America/Port-au-Prince'
      ],
      days: {
        '01-01': {
          _name: 'Independence Day'
        },
        '01-02': {
          name: {
            fr: 'Jour des Aieux',
            en: 'Ancestry Day'
          }
        },
        '01-06': {
          _name: '01-06',
          name: {
            fr: 'Le Jour des Rois'
          },
          type: 'observance'
        },
        'easter -48 14:00': {
          name: {
            fr: 'Lundi Gras',
            en: 'Lundi Gras'
          }
        },
        'easter -47': {
          name: {
            fr: 'Mardi Gras',
            en: 'Mardi Gras'
          }
        },
        'easter -46': {
          _name: 'easter -46',
          type: 'observance'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter'
        },
        'easter 39': {
          _name: 'easter 39'
        },
        'easter 60': {
          _name: 'easter 60'
        },
        '05-01': {
          _name: '05-01'
        },
        '05-18': {
          name: {
            fr: "Jour du Drapeau et de l'Université",
            en: "Flag and Universities' Day"
          }
        },
        '08-15': {
          _name: '08-15'
        },
        '10-17': {
          name: {
            fr: 'Anniversaire de la mort de Dessalines',
            en: 'Anniversary of the death of Dessalines'
          }
        },
        '11-01': {
          _name: '11-01'
        },
        '11-02': {
          _name: '11-02'
        },
        '11-18': {
          name: {
            fr: 'Vertières',
            en: 'Battle of Vertières Day'
          }
        },
        '12-05': {
          name: {
            fr: "Découverte d'Haïti",
            en: 'Discovery Day'
          },
          type: 'observance'
        },
        '12-25': {
          _name: '12-25'
        }
      }
    },
    HU: {
      names: {
        hu: 'Magyarország',
        en: 'Hungary'
      },
      dayoff: 'sunday',
      langs: [
        'hu'
      ],
      zones: [
        'Europe/Budapest'
      ],
      days: {
        '01-01': {
          _name: '01-01',
          type: 'public'
        },
        '02-01': {
          name: {
            hu: 'A köztársaság emléknapja',
            en: 'Memorial Day of the Republic'
          },
          type: 'observance'
        },
        '02-25': {
          name: {
            hu: 'A kommunista diktatúrák áldozatainak emléknapja',
            en: 'Memorial Day for the Victims of the Communist Dictatorships'
          },
          type: 'observance'
        },
        '03-08': {
          _name: '03-08',
          type: 'observance'
        },
        '03-15': {
          name: {
            hu: '1948-as forradalom',
            en: 'National Day'
          },
          type: 'public'
        },
        '04-16': {
          name: {
            en: 'Memorial Day for the Victims of the Holocaust',
            hu: 'A holokauszt áldozatainak emléknapja'
          },
          type: 'observance'
        },
        easter: {
          _name: 'easter',
          type: 'public'
        },
        'easter 1': {
          _name: 'easter 1',
          type: 'public'
        },
        '05-01': {
          _name: '05-01',
          type: 'public'
        },
        '1st sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        '05-21': {
          name: {
            en: 'National Defense Day',
            hu: 'Honvédelmi nap'
          },
          type: 'observance'
        },
        'easter 49': {
          _name: 'easter 49',
          type: 'public'
        },
        'easter 50': {
          _name: 'easter 50',
          type: 'public'
        },
        '06-04': {
          name: {
            en: 'Day of National Unity',
            hu: 'A nemzeti összetartozás napja'
          },
          type: 'observance'
        },
        '06-19': {
          name: {
            en: 'Day of the Independent Hungary',
            hu: 'A független Magyarország napja'
          },
          type: 'observance'
        },
        '08-20': {
          name: {
            hu: 'Szent István ünnepe',
            en: "Saint Stephen's Day"
          },
          type: 'public'
        },
        '10-06': {
          name: {
            en: 'Memorial Day for the Martyrs of Arad',
            hu: 'Az aradi vértanúk emléknapja'
          },
          type: 'observance'
        },
        '10-23': {
          name: {
            hu: '1956-os forradalom',
            en: 'National Day'
          },
          type: 'public'
        },
        '11-01': {
          _name: '11-01',
          type: 'public'
        },
        '12-06': {
          _name: '12-06',
          type: 'observance'
        },
        '12-24': {
          _name: '12-24',
          type: 'optional'
        },
        '12-25': {
          _name: '12-25',
          type: 'public'
        },
        '12-26': {
          _name: '12-26',
          type: 'public'
        },
        '12-31': {
          _name: '12-31',
          type: 'observance'
        }
      }
    },
    IC: {
      names: {
        es: 'Islas Canarias',
        en: 'Canary Islands'
      },
      langs: [
        'es'
      ],
      zones: [
        'Atlantic/Canary'
      ],
      dayoff: 'sunday',
      _days: 'ES',
      days: {
        '05-30': {
          name: {
            es: 'Día de Canarias',
            en: 'Canary Islands Day'
          }
        }
      },
      regions: {
        EH: {
          names: {
            es: 'El Hierro'
          },
          days: {
            '09-24': {
              name: {
                es: 'Nuestra Señora de los Reyes'
              }
            }
          }
        },
        FU: {
          names: {
            es: 'Fuerteventura'
          },
          days: {
            '09-18': {
              name: {
                es: 'Nuestra Señora de la Peña'
              }
            }
          }
        },
        GC: {
          names: {
            es: 'Gran Canaria'
          },
          days: {
            '09-08': {
              name: {
                es: 'Nuestra Señora del Pino'
              }
            }
          }
        },
        LG: {
          names: {
            es: 'La Gomera'
          },
          days: {
            '10-05': {
              name: {
                es: 'Nuestra Señora de Guadalupe'
              }
            }
          }
        },
        LP: {
          names: {
            es: 'La Palma'
          },
          days: {
            '08-05': {
              name: {
                es: 'Nuestra Señora de las Nieves'
              }
            }
          }
        },
        LA: {
          names: {
            es: 'Lanzarote'
          },
          days: {
            '09-15': {
              name: {
                es: 'Nuestra Señora de los Dolores'
              }
            }
          }
        },
        TE: {
          names: {
            es: 'Tenerife'
          },
          days: {
            '09-07': {
              name: {
                es: 'La Bajada de la Virgen del Socorro'
              }
            }
          }
        }
      }
    },
    ID: {
      names: {
        en: 'Indonesia',
        id: 'Indonesia'
      },
      langs: [
        'id'
      ],
      zones: [
        'Asia/Jakarta',
        'Asia/Pontianak',
        'Asia/Makassar',
        'Asia/Jayapura'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        'chinese 01-0-01': {
          name: {
            en: 'Chinese New Year',
            id: 'Tahun Baru Imlek'
          }
        },
        'easter -2': {
          _name: 'easter -2'
        },
        '05-01': {
          _name: '05-01'
        },
        'easter 39': {
          _name: 'easter 39'
        },
        '06-01': {
          name: {
            en: 'Pancasila Day',
            id: 'Hari Lahir Pancasila'
          }
        },
        '08-17': {
          _name: 'Independence Day'
        },
        '12-25': {
          _name: '12-25'
        },
        '1 Muharram': {
          _name: '1 Muharram'
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal'
        },
        '27 Rajab': {
          _name: '27 Rajab'
        },
        '1 Shawwal': {
          _name: '1 Shawwal'
        },
        '2 Shawwal': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah'
        },
        '2009-03-26': {
          name: {
            en: 'Nyepi',
            id: 'Hari Raya Nyepi'
          }
        },
        '2010-03-16': {
          name: {
            en: 'Nyepi',
            id: 'Hari Raya Nyepi'
          }
        },
        '2011-03-05': {
          name: {
            en: 'Nyepi',
            id: 'Hari Raya Nyepi'
          }
        },
        '2012-03-23': {
          name: {
            en: 'Nyepi',
            id: 'Hari Raya Nyepi'
          }
        },
        '2013-03-12': {
          name: {
            en: 'Nyepi',
            id: 'Hari Raya Nyepi'
          }
        },
        '2014-03-31': {
          name: {
            en: 'Nyepi',
            id: 'Hari Raya Nyepi'
          }
        },
        '2015-03-21': {
          name: {
            en: 'Nyepi',
            id: 'Hari Raya Nyepi'
          }
        },
        '2016-03-09': {
          name: {
            en: 'Nyepi',
            id: 'Hari Raya Nyepi'
          }
        },
        '2017-03-28': {
          name: {
            en: 'Nyepi',
            id: 'Hari Raya Nyepi'
          }
        },
        '2018-03-17': {
          name: {
            en: 'Nyepi',
            id: 'Hari Raya Nyepi'
          }
        },
        '2019-03-07': {
          name: {
            en: 'Nyepi',
            id: 'Hari Raya Nyepi'
          }
        },
        '2020-03-25': {
          name: {
            en: 'Nyepi',
            id: 'Hari Raya Nyepi'
          }
        },
        '2021-03-14': {
          name: {
            en: 'Nyepi',
            id: 'Hari Raya Nyepi'
          }
        },
        '2022-03-03': {
          name: {
            en: 'Nyepi',
            id: 'Hari Raya Nyepi'
          }
        },
        '2023-03-22': {
          name: {
            en: 'Nyepi',
            id: 'Hari Raya Nyepi'
          }
        },
        '2024-03-11': {
          name: {
            en: 'Nyepi',
            id: 'Hari Raya Nyepi'
          }
        },
        '2025-03-29': {
          name: {
            en: 'Nyepi',
            id: 'Hari Raya Nyepi'
          }
        },
        '2026-03-19': {
          name: {
            en: 'Nyepi',
            id: 'Hari Raya Nyepi'
          }
        },
        '2001-05-07': {
          _name: 'Vesak'
        },
        '2002-05-26': {
          _name: 'Vesak'
        },
        '2003-05-16': {
          _name: 'Vesak'
        },
        '2004-06-03': {
          _name: 'Vesak'
        },
        '2005-05-24': {
          _name: 'Vesak'
        },
        '2006-05-13': {
          _name: 'Vesak'
        },
        '2007-06-01': {
          _name: 'Vesak'
        },
        '2008-05-20': {
          _name: 'Vesak'
        },
        '2009-05-09': {
          _name: 'Vesak'
        },
        '2010-05-28': {
          _name: 'Vesak'
        },
        '2011-05-17': {
          _name: 'Vesak'
        },
        '2012-05-06': {
          _name: 'Vesak'
        },
        '2013-05-25': {
          _name: 'Vesak'
        },
        '2014-05-15': {
          _name: 'Vesak'
        },
        '2015-06-02': {
          _name: 'Vesak'
        },
        '2016-05-22': {
          _name: 'Vesak'
        },
        '2017-05-11': {
          _name: 'Vesak'
        },
        '2018-05-29': {
          _name: 'Vesak'
        },
        '2019-05-19': {
          _name: 'Vesak'
        },
        '2020-05-07': {
          _name: 'Vesak'
        },
        '2021-05-26': {
          _name: 'Vesak'
        },
        '2022-05-16': {
          _name: 'Vesak'
        },
        '2023-05-06': {
          _name: 'Vesak'
        },
        '2024-05-23': {
          _name: 'Vesak'
        }
      }
    },
    IE: {
      names: {
        en: 'Ireland'
      },
      dayoff: 'sunday',
      zones: [
        'Europe/Dublin'
      ],
      langs: [
        'en'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '03-17': {
          name: {
            en: 'St. Patrick’s Day'
          }
        },
        '03-17 and if saturday then next monday if sunday then next monday': {
          name: {
            en: 'St. Patrick’s Day'
          },
          substitute: true,
          type: 'bank'
        },
        'easter -21': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        'easter -2': {
          _name: 'easter -2',
          type: 'bank'
        },
        easter: {
          _name: 'easter'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '1st monday in May': {
          name: {
            en: 'May Day'
          }
        },
        '1st monday in June': {
          name: {
            en: 'First Monday in June'
          }
        },
        '1st monday in August': {
          name: {
            en: 'First Monday in August'
          }
        },
        '1st monday before 10-31': {
          name: {
            en: 'October Bank Holiday',
            type: 'bank'
          }
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26',
          name: {
            en: "St. Stephen's Day"
          }
        },
        '12-26 and if saturday then next monday if sunday then next monday': {
          _name: '12-26',
          name: {
            en: "St. Stephen's Day"
          },
          substitute: true,
          type: 'bank'
        },
        '12-27 if saturday then next monday if sunday then next tuesday': {
          name: {
            en: 'Christmas Bank Holiday'
          },
          type: 'bank'
        },
        '3rd sunday in June': {
          _name: 'Fathers Day',
          type: 'observance'
        }
      }
    },
    IL: {
      names: {
        he: 'מְדִינַת יִשְׂרָאֵל',
        en: 'Israel'
      },
      langs: [
        'he'
      ],
      zones: [
        'Asia/Jerusalem'
      ],
      dayoff: 'Saturday',
      days: {
        '1 Tishrei': {
          name: {
            he: 'ראש השנה',
            en: 'Rosh Hashanah (Yom Teruah)'
          }
        },
        '2 Tishrei': {
          name: {
            he: 'ראש השנה יום 2',
            en: 'Rosh Hashanah (Day 2)'
          }
        },
        '3 Tishrei if Saturday then next Sunday': {
          name: {
            he: 'צום גדליה',
            en: 'Fast of Gedaliah (Tzom Gedalya)'
          },
          type: 'observance'
        },
        '10 Tishrei': {
          name: {
            he: 'יום כיפור',
            en: 'Day of Atonement (Yom Kippur)'
          }
        },
        '15 Tishrei': {
          name: {
            he: 'סוכות',
            en: 'Feast of Tabernacles (Sukkot)'
          }
        },
        '16 Tishrei P6D': {
          name: {
            he: 'חול המועד סוכות',
            en: 'The week of Sukkot'
          },
          type: 'school',
          note: 'Collective paid leave in many businesses and government offices'
        },
        '22 Tishrei': {
          name: {
            he: 'שמחת תורה/שמיני עצרת',
            en: 'Simchat Torah/ Shmini Atzeret'
          }
        },
        '12 Cheshvan if Friday,Saturday then previous Thursday since 1997': {
          name: {
            he: 'יום רבין',
            en: 'Rabin Day'
          },
          type: 'observance',
          note: 'National remembrance day, business as usual'
        },
        '29 Cheshvan': {
          name: {
            he: 'סיגד',
            en: 'Sigd'
          },
          type: 'observance',
          note: 'Festival of the Ethiopian Jews, optional paid leave, business as usual'
        },
        '6 Kislev if Saturday then next Sunday': {
          name: {
            en: 'Ben-Gurion Day',
            he: 'יום בן-גוריון'
          },
          type: 'observance',
          note: 'Day marked by the Knesset'
        },
        '25 Kislev P8D': {
          name: {
            en: 'Hanukkah',
            he: 'חנוכה'
          },
          type: 'school'
        },
        '10 Tevet': {
          name: {
            en: 'Tenth of Tevet',
            he: 'צום עשרה בטבת'
          },
          type: 'observance'
        },
        '15 Shvat': {
          name: {
            en: 'Tu Bishvat (Arbor Day)',
            he: 'ט"ו בשבט'
          },
          type: 'observance'
        },
        '13 AdarII if Saturday then previous Thursday': {
          name: {
            en: 'Fast of Esther',
            he: 'תענית אסתר'
          },
          type: 'school'
        },
        '14 AdarII P2D': {
          name: {
            en: 'Purim',
            he: 'פורים'
          },
          type: 'school',
          note: 'optional paid leave'
        },
        '10 Nisan': {
          name: {
            en: 'Aliyah Day',
            he: 'יום העלייה'
          },
          type: 'observance',
          note: 'Official holiday, business as usual'
        },
        '15 Nisan': {
          name: {
            en: 'Passover (Pesach)',
            he: 'פסח'
          }
        },
        '16 Nisan P5D': {
          name: {
            en: 'Passover (intermediate days)',
            he: 'חול המועד פסח'
          },
          type: 'school',
          note: 'School holiday, collective paid leave in many businesses and government offices'
        },
        '21 Nisan': {
          name: {
            en: 'Mimouna, Seventh day of Passover',
            he: 'מימונה, שביעי של פסח'
          }
        },
        '27 Nisan if Friday then previous Thursday if Sunday then next Monday': {
          name: {
            en: 'Holocaust Remembrance Day (Yom HaShoah)',
            he: 'יום הזיכרון לשואה ולגבורה'
          },
          type: 'observance',
          note: 'National remembrance day, business as usual except places of public entertainment'
        },
        '05-09': {
          name: {
            en: 'Victory in Europe Day',
            he: 'יום הניצחון על גרמניה הנאצית'
          },
          type: 'observance'
        },
        '4 Iyyar if Thursday,Friday then previous Wednesday if Sunday then next Monday': {
          name: {
            en: 'Fallen Soldiers and Victims of Terrorism Remembrance Day (Yom HaZikaron)',
            he: 'יום הזיכרון לחללי מערכות ישראל ונפגעי פעולות האיבה'
          },
          type: 'observance',
          note: 'National remembrance day, business as usual except places of public entertainment'
        },
        '5 Iyyar if Friday,Saturday then previous Thursday if Monday then next Tuesday': {
          name: {
            en: 'Independence Day (Yom HaAtzmaut)',
            he: 'יום העצמאות'
          }
        },
        '10 Iyyar if Saturday then next Sunday since 2004': {
          name: {
            en: 'Herzl Day',
            he: 'יום הרצל'
          },
          type: 'observance',
          note: 'Day marked by the Knesset'
        },
        '18 Iyyar': {
          name: {
            en: 'Lag BaOmer',
            he: 'ל"ג בעומר'
          },
          type: 'school'
        },
        '28 Iyyar': {
          name: {
            en: 'Jerusalem Day (Yom Yerushalayim)',
            he: 'יום ירושלים'
          },
          type: 'observance',
          note: 'Optional paid leave'
        },
        '6 Sivan': {
          name: {
            en: 'Shavuot (Feast of Weeks)',
            he: 'שבועות'
          }
        },
        '17 Tamuz if Saturday then next Sunday': {
          name: {
            en: 'Seventeenth of Tamuz, fast',
            he: 'שבעה עשר בתמוז'
          },
          type: 'observance'
        },
        '29 Tamuz if Saturday then next Sunday': {
          name: {
            en: 'Jabotinsky Day',
            he: "יום ז'בוטינסקי"
          },
          type: 'observance',
          note: 'Day marked by the Knesset'
        },
        '9 Av if Saturday then next Sunday': {
          name: {
            en: "Tisha B'Av, fast",
            he: 'תשעה באב'
          },
          type: 'observance',
          note: 'Optional paid leave, business as usual except places of public entertainment'
        },
        '15 Av': {
          name: {
            en: "Tu B'Av (Fifteenth of Av)",
            he: 'ט"ו באב'
          },
          type: 'observance'
        },
        '2015-03-17': {
          name: {
            en: 'Election Day',
            he: 'יום הבחירות'
          }
        },
        '2019-04-09': {
          name: {
            en: 'Election Day',
            he: 'יום הבחירות'
          }
        },
        '2019-09-17': {
          name: {
            en: 'Election Day',
            he: 'יום הבחירות'
          }
        },
        '2020-03-02': {
          name: {
            en: 'Election Day',
            he: 'יום הבחירות'
          }
        },
        '2021-03-23': {
          name: {
            en: 'Election Day',
            he: 'יום הבחירות'
          }
        }
      }
    },
    IM: {
      names: {
        en: 'Isle of Man'
      },
      zones: [
        'Europe/Isle_of_Man'
      ],
      langs: [
        'en'
      ],
      _days: [
        'GB'
      ],
      days: {
        '2nd friday in June': {
          name: {
            en: 'Tourist Trophy, Senior Race Day'
          }
        },
        '07-05': {
          name: {
            en: 'Tynwald Day'
          }
        }
      }
    },
    IR: {
      names: {
        fa: 'جمهوری اسلامی ایران',
        en: 'Iran'
      },
      langs: [
        'fa',
        'en'
      ],
      zones: [
        'Asia/Tehran'
      ],
      dayoff: 'Friday',
      days: {
        '1 Farvardin': {
          name: {
            fa: 'نوروز',
            en: 'Nowruz'
          }
        },
        '2 Farvardin': {
          name: {
            fa: 'نوروز',
            en: 'Nowruz'
          }
        },
        '3 Farvardin': {
          name: {
            fa: 'نوروز',
            en: 'Nowruz'
          }
        },
        '4 Farvardin': {
          name: {
            fa: 'نوروز',
            en: 'Nowruz'
          }
        },
        '12 Farvardin': {
          name: {
            fa: 'روز جمهوری اسلامی',
            en: 'Islamic Republic Day'
          }
        },
        '13 Farvardin': {
          name: {
            fa: 'سیزده بدر',
            en: 'Sizdah Bedar'
          }
        },
        '14 Khordad': {
          name: {
            fa: 'رﺣﻠﺖ اﻣﺎم ﺧﻤﯿﻨﯽ',
            en: "Imam Khomeini's Demise"
          }
        },
        '15 Khordad': {
          name: {
            fa: 'قیام ۱۵ خرداد',
            en: 'Revolt of Khordad 15'
          }
        },
        '22 Bahman': {
          name: {
            fa: 'انقلاب اسلامی پنجاه و هفت',
            en: 'Anniversary of Islamic Revolution'
          }
        },
        '29 Esfand': {
          name: {
            fa: 'ملی شدن صنعت نفت',
            en: 'Nationalization of the Iranian oil industry'
          }
        },
        '9 Muharram': {
          name: {
            fa: 'ﺗﺎﺳﻮﻋﺎی ﺣﺴﯿﻨﯽ',
            en: 'Tasoua'
          }
        },
        '10 Muharram': {
          name: {
            fa: 'ﻋﺎﺷﻮرای ﺣﺴﯿﻨﯽ',
            en: 'Ashoura'
          }
        },
        '20 Safar': {
          name: {
            fa: 'اربعین حسینی',
            en: 'Arbaeen-e Hosseini'
          }
        },
        '28 Safar': {
          name: {
            fa: 'رﺣﻠﺖ ﺣﻀﺮت رﺳﻮل اﮐﺮم صلّی الله علیه وآله و سلّم',
            en: 'Demise of Prophet Muhammad and Imam Hassan (Mujtaba)'
          }
        },
        '30 Safar': {
          name: {
            fa: 'ﺷﻬﺎدت ﺣﻀﺮت اﻣﺎم رﺿﺎ ﻋﻠﯿﻪاﻟﺴﻼم',
            en: 'Martyrdom of Imam Reza'
          }
        },
        '8 Rabi al-awwal': {
          name: {
            fa: 'شهادت امام حسن عسكری علیه‌السلام',
            en: 'Martyrdom of Imam Hassan'
          }
        },
        '17 Rabi al-awwal': {
          name: {
            fa: 'ولادت حضرت رسول اکرم صلّی الله علیه وآله و سلّم',
            en: 'Birthday of Muhammad Prophet'
          }
        },
        '3 Jumada al-thani': {
          name: {
            fa: 'ﺷﻬﺎدت ﺣﻀﺮت ﻓﺎﻃﻤﻪ زﻫﺮا ﺳﻼم اﷲ ﻋﻠﯿﻬﺎ',
            en: 'Martyrdom of Fatima-Zahara'
          }
        },
        '13 Rajab': {
          name: {
            fa: 'وﻻدت ﺣﻀﺮت اﻣﺎم ﻋﻠﯽ ﻋﻠﯿﻪ اﻟﺴﻼم',
            en: 'Birthday of Imam Ali'
          }
        },
        '27 Rajab': {
          name: {
            fa: 'ﻣﺒﻌﺚ ﺣﻀﺮت رﺳﻮل اﮐﺮم ﺻﻠﯽ اﷲ ﻋﻠﯿﻪ و آﻟﻪ',
            en: 'Mabaas of Muhammad'
          }
        },
        '15 Shaban': {
          name: {
            fa: 'وﻻدت ﺣﻀﺮت ﻗﺎﺋﻢ ﻋﺠﻞاﷲ ﺗﻌﺎﻟﯽ ﻓﺮﺟﻪ شریف',
            en: 'Birthday of Imam Mahdi'
          }
        },
        '21 Ramadan': {
          name: {
            fa: 'ﺷﻬﺎدت ﺣﻀﺮت ﻋﻠﯽ ﻋﻠﯿﻪاﻟﺴﻼم',
            en: 'Martyrdom of Imam Ali'
          }
        },
        '1 Shawwal': {
          _name: '1 Shawwal'
        },
        '2 Shawwal': {
          name: {
            fa: 'ﺑﻪ ﻣﻨﺎﺳﺒﺖ ﻋﯿﺪ ﺳﻌﯿﺪ ﻓﻄﺮ',
            en: 'Holyday for Fetr Eeid'
          }
        },
        '25 Shawwal': {
          name: {
            fa: 'ﺷﻬﺎدت ﺣﻀﺮت اﻣﺎم ﺟﻌﻔﺮ ﺻﺎدق ﻋﻠﯿﻪاﻟﺴﻼم',
            en: 'Martyrdom of Imam Jafar'
          }
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah'
        },
        '18 Dhu al-Hijjah': {
          name: {
            fa: 'ﻋﯿﺪ ﺳﻌﯿﺪ ﻏﺪﯾﺮ ﺧﻢ',
            en: 'Eid al-Ghadeer'
          }
        }
      }
    },
    IS: {
      names: {
        is: 'Ísland',
        en: 'Iceland'
      },
      dayoff: 'sunday',
      zones: [
        'Atlantic/Reykjavik'
      ],
      langs: [
        'is'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-06': {
          _name: '01-06',
          type: 'observance'
        },
        'friday after 01-18': {
          name: {
            is: 'Bóndadagur'
          },
          type: 'observance'
        },
        '02-18': {
          name: {
            is: 'Konudagur',
            en: "Woman's Day"
          },
          type: 'observance'
        },
        'easter -48': {
          name: {
            is: 'Bolludagur'
          },
          type: 'observance'
        },
        'easter -47': {
          name: {
            is: 'Sprengidagur'
          },
          type: 'observance'
        },
        'easter -46': {
          _name: 'easter -46',
          type: 'observance'
        },
        'easter -7': {
          _name: 'easter -7',
          type: 'observance'
        },
        'easter -3': {
          _name: 'easter -3'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        'thursday after 04-18': {
          name: {
            is: 'Sumardagurinn fyrsti',
            en: 'First Day of Summer'
          }
        },
        '05-01': {
          _name: '05-01'
        },
        '2nd sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        'easter 39': {
          _name: 'easter 39'
        },
        'easter 49': {
          _name: 'easter 49'
        },
        'easter 50': {
          _name: 'easter 50'
        },
        '1st sunday in June': {
          name: {
            is: 'Sjómannadagurinn',
            en: "The Seamen's Day"
          },
          type: 'observance'
        },
        '06-17': {
          name: {
            is: 'Íslenski þjóðhátíðardagurinn',
            en: 'Icelandic National Day'
          }
        },
        '1st monday in August': {
          name: {
            is: 'Frídagur verslunarmanna',
            en: 'Commerce Day'
          }
        },
        'saturday after 10-21': {
          name: {
            is: 'Fyrsti vetrardagur',
            en: 'First Day of Winter'
          },
          type: 'observance'
        },
        '11-16': {
          name: {
            is: 'Dagur íslenskrar tungu',
            en: 'Icelandic Language Day'
          },
          type: 'observance'
        },
        '12-23': {
          name: {
            is: 'Þorláksmessa',
            en: "St Þorlákur's Day"
          },
          type: 'observance'
        },
        '12-24 13:00 if sunday then 00:00': {
          _name: '12-24'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        },
        '12-31 13:00 if sunday then 00:00': {
          _name: '12-31'
        }
      }
    },
    IT: {
      names: {
        it: 'Italia',
        en: 'Italia'
      },
      dayoff: 'sunday',
      zones: [
        'Europe/Rome'
      ],
      langs: [
        'it'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-06': {
          _name: '01-06'
        },
        easter: {
          _name: 'easter'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '04-25': {
          name: {
            it: 'Anniversario della Liberazione',
            en: 'Liberation Day'
          }
        },
        '05-01': {
          _name: '05-01'
        },
        '2nd sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        '06-02': {
          name: {
            it: 'Festa della Repubblica',
            en: 'Republic Day'
          }
        },
        '08-15': {
          _name: '08-15'
        },
        '11-01': {
          _name: '11-01'
        },
        '12-08': {
          _name: '12-08'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        },
        '2011-03-17': {
          name: {
            it: 'Festa Nazionale 2011',
            en: 'National Day 2011'
          }
        }
      },
      states: {
        32: {
          name: 'Südtirol, Alto Adige',
          days: {
            'easter 50': {
              _name: 'easter 50'
            }
          }
        }
      }
    },
    JE: {
      names: {
        en: 'Jersey'
      },
      zones: [
        'Europe/Jersey'
      ],
      langs: [
        'en'
      ],
      _days: [
        'GB'
      ],
      days: {
        '05-09': {
          name: {
            en: 'Liberation Day'
          }
        }
      }
    },
    JM: {
      names: {
        en: 'Jamaica'
      },
      dayoff: 'sunday',
      langs: [
        'en'
      ],
      zones: [
        'America/Jamaica'
      ],
      days: {
        '01-01 and if sunday then next monday': {
          _name: '01-01',
          substitute: true
        },
        'easter -46': {
          _name: 'easter -46'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-23 if saturday,sunday then next monday': {
          _name: '05-01'
        },
        '08-01 if sunday then next monday': {
          name: {
            en: 'Emancipation Day'
          }
        },
        '08-06 and if sunday then next monday': {
          _name: 'Independence Day',
          substitute: true
        },
        '3rd monday in October': {
          name: {
            en: 'National Heroes Day'
          }
        },
        '12-25 and if sunday then next tuesday': {
          _name: '12-25',
          substitute: true
        },
        '12-26 and if sunday then next monday': {
          _name: '12-26',
          substitute: true
        }
      }
    },
    JP: {
      names: {
        jp: '日本',
        en: 'Japan'
      },
      dayoff: 'sunday',
      langs: [
        'jp'
      ],
      zones: [
        'Asia/Tokyo'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        'substitutes 01-01 if sunday then next monday': {
          substitute: true,
          _name: '01-01',
          active: [
            {
              from: '1973-04-12T00:00:00.000Z'
            }
          ]
        },
        '01-02': {
          name: {
            en: 'January 2nd',
            jp: '銀行休業日'
          },
          type: 'bank'
        },
        '01-03': {
          name: {
            en: 'January 3rd',
            jp: '銀行休業日'
          },
          type: 'bank'
        },
        '01-15': {
          name: {
            en: 'Coming of Age Day',
            jp: '成人の日'
          },
          active: [
            {
              from: '1948-07-20T00:00:00.000Z',
              to: '1999-12-31T00:00:00.000Z'
            }
          ]
        },
        'substitutes 01-15 and if sunday then next monday': {
          substitute: true,
          name: {
            en: 'Coming of Age Day',
            jp: '成人の日'
          },
          active: [
            {
              from: '1973-04-12T00:00:00.000Z',
              to: '1999-12-31T00:00:00.000Z'
            }
          ]
        },
        '2nd monday in January': {
          name: {
            en: 'Coming of Age Day',
            jp: '成人の日'
          },
          active: [
            {
              from: '2000-01-01T00:00:00.000Z'
            }
          ]
        },
        '02-11': {
          name: {
            en: 'Foundation Day',
            jp: '建国記念の日'
          },
          active: [
            {
              from: '1967-01-01T00:00:00.000Z'
            }
          ]
        },
        'substitutes 02-11 and if sunday then next monday': {
          substitute: true,
          name: {
            en: 'Foundation Day',
            jp: '建国記念の日'
          },
          active: [
            {
              from: '1973-04-12T00:00:00.000Z'
            }
          ]
        },
        '02-23 and if sunday then next monday': {
          substitute: true,
          name: {
            en: "Emperor's Birthday",
            jp: '天皇誕生日'
          },
          active: [
            {
              from: '2020-01-01T00:00:00.000Z'
            }
          ]
        },
        '1989-02-24': {
          name: {
            en: 'State Funeral of Emperor Showa',
            jp: '大喪の礼'
          }
        },
        'march equinox in +09:00': {
          name: {
            en: 'Spring Equinox Day',
            jp: '春分の日'
          },
          active: [
            {
              from: '1948-07-20T00:00:00.000Z'
            }
          ]
        },
        'substitutes march equinox in +09:00 and if sunday then next monday': {
          substitute: true,
          name: {
            en: 'Spring Equinox Day',
            jp: '春分の日'
          },
          active: [
            {
              from: '1973-04-12T00:00:00.000Z'
            }
          ]
        },
        '1959-04-10': {
          name: {
            en: 'Marriage of Crown Prince Akihito',
            jp: '結婚の儀'
          }
        },
        '04-29': {
          name: {
            en: "Emperor's Birthday",
            jp: '天皇誕生日'
          },
          active: [
            {
              from: '1948-07-20T00:00:00.000Z',
              to: '1988-12-31T00:00:00.000Z'
            }
          ]
        },
        'substitutes 04-29 and if sunday then next monday': {
          substitute: true,
          name: {
            en: "Emperor's Birthday",
            jp: '天皇誕生日'
          },
          active: [
            {
              from: '1973-04-12T00:00:00.000Z',
              to: '1988-12-31T00:00:00.000Z'
            }
          ]
        },
        '04-29 and if sunday then next monday #1': {
          substitute: true,
          name: {
            en: 'Greenery Day',
            jp: 'みどりの日'
          },
          active: [
            {
              from: '1989-01-01T00:00:00.000Z',
              to: '2006-12-31T00:00:00.000Z'
            }
          ]
        },
        '04-29 and if sunday then next monday #2': {
          substitute: true,
          name: {
            en: 'Showa Day',
            jp: '昭和の日'
          },
          active: [
            {
              from: '2007-01-01T00:00:00.000Z'
            }
          ]
        },
        '2019-04-30': {
          name: {
            en: "Citizens' Holiday",
            jp: '国民の休日'
          }
        },
        '2019-05-01': {
          name: {
            en: 'Coronation Day',
            jp: '即位の日'
          }
        },
        '2019-05-02': {
          name: {
            en: "Citizens' Holiday",
            jp: '国民の休日'
          }
        },
        '05-03': {
          _name: 'Constitution Day'
        },
        'substitutes 05-03 if sunday then next monday': {
          substitute: true,
          _name: 'Constitution Day',
          active: [
            {
              from: '1973-04-12T00:00:00.000Z',
              to: '2006-12-31T00:00:00.000Z'
            }
          ]
        },
        'substitutes 05-03 if sunday then next wednesday': {
          substitute: true,
          _name: 'Constitution Day',
          active: [
            {
              from: '2007-01-01T00:00:00.000Z'
            }
          ]
        },
        '05-04 not on sunday, monday': {
          name: {
            en: "Citizens' Holiday",
            jp: '国民の休日'
          },
          active: [
            {
              from: '1986-01-01T00:00:00.000Z',
              to: '2006-12-31T00:00:00.000Z'
            }
          ]
        },
        '05-04 and if sunday then next tuesday': {
          substitute: true,
          name: {
            en: 'Greenery Day',
            jp: 'みどりの日'
          },
          active: [
            {
              from: '2007-01-01T00:00:00.000Z'
            }
          ]
        },
        '05-05': {
          name: {
            en: "Children's Day",
            jp: 'こどもの日'
          }
        },
        'substitutes 05-05 if sunday then next monday': {
          substitute: true,
          name: {
            en: "Children's Day",
            jp: 'こどもの日'
          },
          active: [
            {
              from: '1973-04-12T00:00:00.000Z'
            }
          ]
        },
        '1993-06-09': {
          name: {
            en: 'Marriage of Crown Prince Naruhito',
            jp: '結婚の儀'
          }
        },
        '07-20': {
          name: {
            en: 'Marine Day',
            jp: '海の日'
          },
          active: [
            {
              from: '1996-01-01T00:00:00.000Z',
              to: '2002-12-31T00:00:00.000Z'
            }
          ]
        },
        'substitutes 07-20 if sunday then next monday': {
          substitute: true,
          name: {
            en: 'Marine Day',
            jp: '海の日'
          },
          active: [
            {
              from: '1996-01-01T00:00:00.000Z',
              to: '2002-12-31T00:00:00.000Z'
            }
          ]
        },
        '3rd monday in July': {
          name: {
            en: 'Marine Day',
            jp: '海の日'
          },
          disable: [
            '2020-07-20',
            '2021-07-19'
          ],
          enable: [
            '2020-07-23',
            '2021-07-22'
          ],
          active: [
            {
              from: '2003-01-01T00:00:00.000Z'
            }
          ]
        },
        'substitutes 2021-08-08 and if sunday then next monday': {
          substitute: true,
          name: {
            en: 'Mountain Day',
            jp: '山の日'
          }
        },
        'substitutes 08-11 and if sunday then next monday': {
          substitute: true,
          name: {
            en: 'Mountain Day',
            jp: '山の日'
          },
          disable: [
            '2020-08-11',
            '2021-08-11'
          ],
          enable: [
            '2020-08-10'
          ],
          active: [
            {
              from: '2016-01-01T00:00:00.000Z'
            }
          ]
        },
        '09-15': {
          name: {
            en: 'Respect-for-the-Aged Day',
            jp: '敬老の日'
          },
          active: [
            {
              from: '1966-01-01T00:00:00.000Z',
              to: '2002-12-31T00:00:00.000Z'
            }
          ]
        },
        'substitutes 09-15 and if sunday then next monday': {
          substitute: true,
          name: {
            en: 'Respect-for-the-Aged Day',
            jp: '敬老の日'
          },
          active: [
            {
              from: '1973-04-12T00:00:00.000Z',
              to: '2002-12-31T00:00:00.000Z'
            }
          ]
        },
        '3rd monday in September': {
          name: {
            en: 'Respect-for-the-Aged Day',
            jp: '敬老の日'
          },
          active: [
            {
              from: '2003-01-01T00:00:00.000Z'
            }
          ]
        },
        '09-22 if 09-21 and 09-23 is public holiday': {
          name: {
            en: "Citizens' Holiday",
            jp: '国民の休日'
          }
        },
        'september equinox in +09:00': {
          name: {
            en: 'Autumnal Equinox Day',
            jp: '秋分の日'
          },
          active: [
            {
              from: '1948-07-20T00:00:00.000Z'
            }
          ]
        },
        'substitutes september equinox in +09:00 and if sunday then next monday': {
          substitute: true,
          name: {
            en: 'Autumnal Equinox Day',
            jp: '秋分の日'
          },
          active: [
            {
              from: '1973-04-12T00:00:00.000Z'
            }
          ]
        },
        '10-10': {
          name: {
            en: 'Sports Day',
            jp: '体育の日'
          },
          active: [
            {
              from: '1966-01-01T00:00:00.000Z',
              to: '1999-12-31T00:00:00.000Z'
            }
          ]
        },
        'substitutes 10-10 and if sunday then next monday': {
          substitute: true,
          name: {
            en: 'Sports Day',
            jp: '体育の日'
          },
          active: [
            {
              from: '1973-04-12T00:00:00.000Z',
              to: '1999-12-31T00:00:00.000Z'
            }
          ]
        },
        '2nd monday in October #1': {
          name: {
            en: 'Sports Day',
            jp: '体育の日'
          },
          active: [
            {
              from: '2000-01-01T00:00:00.000Z',
              to: '2019-12-31T00:00:00.000Z'
            }
          ]
        },
        '2nd monday in October #2': {
          name: {
            en: 'Sports Day',
            jp: 'スポーツの日'
          },
          disable: [
            '2020-10-12',
            '2021-10-11'
          ],
          enable: [
            '2020-07-24',
            '2021-07-23'
          ],
          active: [
            {
              from: '2020-01-01T00:00:00.000Z'
            }
          ]
        },
        '2019-10-22': {
          name: {
            en: 'Enthronement Ceremony Day',
            jp: '即位礼正殿の儀'
          }
        },
        '11-03': {
          substitute: true,
          name: {
            en: 'Culture Day',
            jp: '文化の日'
          },
          active: [
            {
              from: '1948-07-20T00:00:00.000Z'
            }
          ]
        },
        'substitutes 11-03 and if sunday then next monday': {
          substitute: true,
          name: {
            en: 'Culture Day',
            jp: '文化の日'
          },
          active: [
            {
              from: '1973-04-12T00:00:00.000Z'
            }
          ]
        },
        '1990-11-12': {
          name: {
            en: 'Official Enthronement Ceremony of Emperor Heisei (Akihito)',
            jp: '即位礼正殿の儀'
          }
        },
        '11-15': {
          name: {
            en: 'Seven-Five-Three Festival',
            jp: '七五三'
          },
          type: 'observance'
        },
        '11-23': {
          name: {
            en: 'Labor Thanksgiving Day',
            jp: '勤労感謝の日'
          },
          active: [
            {
              from: '1948-07-20T00:00:00.000Z'
            }
          ]
        },
        'substitutes 11-23 and if sunday then next monday': {
          substitute: true,
          name: {
            en: 'Labor Thanksgiving Day',
            jp: '勤労感謝の日'
          },
          active: [
            {
              from: '1973-04-12T00:00:00.000Z'
            }
          ]
        },
        '12-23 and if sunday then next monday': {
          substitute: true,
          name: {
            en: "Emperor's Birthday",
            jp: '天皇誕生日'
          },
          active: [
            {
              from: '1989-01-01T00:00:00.000Z',
              to: '2018-12-31T00:00:00.000Z'
            }
          ]
        },
        '12-25': {
          _name: '12-25',
          type: 'observance'
        },
        '12-31': {
          _name: '12-31',
          type: 'bank'
        }
      }
    },
    KE: {
      names: {
        en: 'Kenya'
      },
      dayoff: 'sunday',
      langs: [
        'sw',
        'en'
      ],
      zones: [
        'Africa/Nairobi'
      ],
      days: {
        '01-01 and if sunday then next monday': {
          substitute: true,
          _name: '01-01'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01 and if sunday then next monday': {
          substitute: true,
          _name: '05-01'
        },
        '06-01 and if sunday then next monday': {
          substitute: true,
          name: {
            sw: 'Siku ya Madaraka',
            en: 'Madaraka Day'
          }
        },
        '10-10 and if sunday then next monday': {
          substitute: true,
          name: {
            en: 'Moi Day'
          }
        },
        '10-20 and if sunday then next monday': {
          substitute: true,
          name: {
            sw: 'Siku ya Mashujaa',
            en: 'Mashujaa Day'
          }
        },
        '12-12 and if sunday then next monday': {
          substitute: true,
          name: {
            sw: 'Siku ya Jamhuri',
            en: 'Jamhuri Day'
          }
        },
        '12-25 and if sunday then next tuesday': {
          substitute: true,
          _name: '12-25'
        },
        '12-26 and if sunday then next monday': {
          substitute: true,
          _name: '12-26'
        },
        '1 Shawwal': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah',
          note: 'For all persons belonging to the Islamic faith.'
        }
      }
    },
    KM: {
      names: {
        fr: 'Union des Comores',
        en: 'Comoros'
      },
      langs: [
        'fr',
        'ar',
        'swb',
        'wlc',
        'wni',
        'zdj'
      ],
      zones: [
        'Africa/Nairobi'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        '03-18': {
          name: {
            fr: 'Journée de Cheikh Al Maarouf',
            en: 'Cheikh Al Maarouf Day'
          }
        },
        '05-01': {
          _name: '05-01'
        },
        '07-06': {
          _name: 'Independence Day'
        },
        '11-12': {
          name: {
            fr: 'Journée Maoré',
            en: 'Maore Day'
          }
        },
        '1 Muharram': {
          _name: '1 Muharram'
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal'
        },
        '1 Shawwal P3DT0H0M': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah P2DT0H0M': {
          _name: '10 Dhu al-Hijjah'
        },
        '27 Rajab': {
          _name: '27 Rajab'
        }
      }
    },
    KN: {
      names: {
        en: 'St. Kitts & Nevis'
      },
      langs: [
        'en'
      ],
      zones: [
        'America/Port_of_Spain'
      ],
      dayoff: 'sunday',
      days: {
        '01-01 and if Saturday then next Monday': {
          substitute: true,
          _name: '01-01'
        },
        '01-02': {
          name: {
            en: 'Carnival Day'
          }
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        'easter 49': {
          _name: 'easter 49',
          type: 'observance'
        },
        'easter 50': {
          _name: 'easter 50'
        },
        '1st Monday in May': {
          _name: '05-01'
        },
        '1st Monday in August': {
          name: {
            en: 'Emancipation Day'
          }
        },
        '1st Tuesday in August': {
          name: {
            en: 'Culturama Day'
          }
        },
        '09-16 and if Sunday then next Monday': {
          substitute: true,
          name: {
            en: "National Heroes' Day"
          }
        },
        '09-19 if Sunday then next Monday': {
          substitute: true,
          _name: 'Independence Day'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        }
      }
    },
    KR: {
      names: {
        ko: '대한민국',
        en: 'South Korea'
      },
      dayoff: 'sunday',
      langs: [
        'ko'
      ],
      zones: [
        'Asia/Seoul'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        'korean 01-0-01 P3D': {
          name: {
            en: 'Korean New Year',
            ko: '설날'
          }
        },
        '03-01': {
          name: {
            en: 'Independence Movement Day',
            ko: '3·1절'
          }
        },
        '05-05': {
          name: {
            en: "Children's Day",
            ko: '어린이날'
          }
        },
        'korean 4-0-8': {
          name: {
            en: "Buddha's Birthday",
            ko: '석가탄신일'
          }
        },
        '06-06': {
          name: {
            en: 'Memorial Day',
            ko: '현충일'
          }
        },
        '07-17': {
          _name: 'Constitution Day',
          type: 'observance'
        },
        '08-15': {
          name: {
            en: 'Liberation Day',
            ko: '광복절'
          }
        },
        'korean 8-0-15 P3D': {
          name: {
            en: 'Korean Thanksgiving',
            ko: '추석'
          }
        },
        '10-03': {
          name: {
            en: 'National Foundation Day',
            ko: '개천절'
          }
        },
        '10-09': {
          name: {
            en: 'Hangul Day',
            ko: '한글날'
          }
        },
        '12-25': {
          _name: '12-25'
        }
      }
    },
    KY: {
      names: {
        en: 'Cayman Islands'
      },
      langs: [
        'en'
      ],
      zones: [
        'America/Panama'
      ],
      dayoff: 'sunday',
      days: {
        '01-01 and if Saturday, Sunday then next Monday': {
          substitute: true,
          _name: '01-01'
        },
        '4th Monday in January': {
          name: {
            en: 'National Heroes Day'
          }
        },
        'easter -46': {
          _name: 'easter -46'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '3rd Monday in May': {
          name: {
            en: 'Discovery Day'
          }
        },
        '07-02': {
          name: {
            en: 'Constitution Day'
          }
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        },
        '2017-05-24': {
          name: 'General Election Day'
        },
        '2021-04-14': {
          name: 'General Election Day'
        },
        '2016-06-13': {
          name: {
            en: "Queen's Birthday"
          }
        },
        '2017-06-19': {
          name: {
            en: "Queen's Birthday"
          }
        },
        '2018-06-11': {
          name: {
            en: "Queen's Birthday"
          }
        },
        '2019-06-10': {
          name: {
            en: "Queen's Birthday"
          }
        },
        '2020-06-15': {
          name: {
            en: "Queen's Birthday"
          }
        },
        '2021-06-14': {
          name: {
            en: "Queen's Birthday"
          }
        },
        '2022-06-20': {
          name: {
            en: "Queen's Birthday"
          }
        },
        '2023-06-19': {
          name: {
            en: "Queen's Birthday"
          }
        },
        '2024-06-17': {
          name: {
            en: "Queen's Birthday"
          }
        },
        '2025-06-16': {
          name: {
            en: "Queen's Birthday"
          }
        },
        '2026-06-15': {
          name: {
            en: "Queen's Birthday"
          }
        }
      }
    },
    LC: {
      names: {
        en: 'St. Lucia'
      },
      langs: [
        'en'
      ],
      zones: [
        'America/Port_of_Spain'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-02': {
          name: {
            en: "Second New Year's Day"
          }
        },
        '02-22': {
          _name: 'Independence Day'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01'
        },
        'easter 50': {
          _name: 'easter 50'
        },
        'easter 60': {
          _name: 'easter 60'
        },
        '1st Friday after 07-10 P4D': {
          name: {
            en: 'Carnival'
          }
        },
        '08-01': {
          name: {
            en: 'Emancipation Day'
          }
        },
        '1st Monday in October': {
          name: {
            en: 'Thanksgiving'
          }
        },
        '12-13': {
          name: {
            en: 'National Day'
          }
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        }
      }
    },
    LI: {
      names: {
        de: 'Lichtenstein',
        en: 'Lichtenstein'
      },
      dayoff: 'sunday',
      langs: [
        'de'
      ],
      zones: [
        'Europe/Zurich'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-02': {
          name: {
            de: 'Berchtoldstag',
            en: 'Berchtold Day'
          },
          type: 'bank'
        },
        '01-06': {
          _name: '01-06'
        },
        '02-02': {
          _name: '02-02',
          type: 'observance'
        },
        '03-19': {
          _name: '03-19',
          type: 'observance'
        },
        'easter -47': {
          _name: 'easter -47',
          type: 'bank'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01'
        },
        '2nd sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        'easter 39': {
          _name: 'easter 39',
          name: {
            de: 'Auffahrt'
          }
        },
        'easter 40': {
          name: {
            de: 'Feiertagsbrücke'
          }
        },
        'easter 49': {
          _name: 'easter 49',
          type: 'observance'
        },
        'easter 50': {
          _name: 'easter 50'
        },
        'easter 60': {
          _name: 'easter 60'
        },
        'easter 61': {
          name: {
            de: 'Feiertagsbrücke'
          }
        },
        '08-15': {
          name: {
            de: 'Staatsfeiertag'
          },
          type: 'observance'
        },
        '09-08': {
          name: {
            de: 'Mariä Geburt'
          }
        },
        '11-01': {
          _name: '11-01',
          type: 'observance'
        },
        '12-08': {
          _name: '12-08'
        },
        '12-24': {
          _name: '12-24',
          type: 'bank'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26',
          name: {
            de: 'Stephanstag'
          }
        },
        '12-31': {
          _name: '12-31',
          type: 'bank'
        }
      }
    },
    LR: {
      names: {
        en: 'Liberia'
      },
      langs: [
        'en'
      ],
      zones: [
        'Africa/Monrovia'
      ],
      dayoff: 'Sunday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        '02-11': {
          name: {
            en: 'Armed Forces Day'
          }
        },
        '2nd Wednesday in March': {
          name: {
            en: 'Decoration Day'
          }
        },
        '03-15': {
          name: {
            en: "J. J. Robert's Day"
          }
        },
        '2nd Friday in April': {
          name: {
            en: 'Fast and Prayer Day'
          }
        },
        '05-14': {
          name: {
            en: 'National Unification Day'
          }
        },
        '07-26': {
          _name: 'Independence Day'
        },
        '08-24': {
          name: {
            en: 'Flag Day'
          }
        },
        '1st Thursday in November': {
          name: {
            en: 'Thanksgiving'
          }
        },
        '11-29': {
          name: {
            en: "William Tubman's Birthday"
          }
        },
        '12-25': {
          _name: '12-25'
        }
      }
    },
    LS: {
      names: {
        st: "\\'Muso oa Lesotho",
        en: 'Lesotho'
      },
      langs: [
        'st',
        'en'
      ],
      zones: [
        'Africa/Johannesburg'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        '03-11': {
          name: {
            en: 'Moshoeshoe Day'
          }
        },
        'easter -2': {
          _name: 'easter -2'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01',
          name: {
            en: "Workers' Day"
          }
        },
        'easter 39': {
          _name: 'easter 39'
        },
        '05-25': {
          name: {
            en: "Africa Day/ Heroes' Day"
          }
        },
        '07-17': {
          name: {
            en: "King Letsie III's Birthday"
          }
        },
        '10-04': {
          _name: 'Independence Day'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        }
      }
    },
    LT: {
      names: {
        lt: 'Lietuva',
        en: 'Lithuania'
      },
      dayoff: 'sunday',
      langs: [
        'lt'
      ],
      zones: [
        'Europe/Vilnius'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '02-16': {
          name: {
            en: 'Day of Restoration of the State of Lithuania',
            lt: 'Lietuvos valstybės atkūrimo diena'
          }
        },
        '03-11': {
          name: {
            en: 'Day of Restoration of Independence of Lithuania',
            lt: 'Lietuvos nepriklausomybės atkūrimo diena'
          }
        },
        easter: {
          _name: 'easter'
        },
        '05-01': {
          _name: '05-01'
        },
        '1st sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        '1st sunday in June': {
          _name: 'Fathers Day',
          type: 'observance'
        },
        '06-24': {
          name: {
            en: "St. John's Day",
            lt: 'Joninės, Rasos'
          }
        },
        '07-06': {
          name: {
            en: 'Statehood Day',
            lt: 'Valstybės diena'
          }
        },
        '08-15': {
          _name: '08-15'
        },
        '11-01': {
          _name: '11-01'
        },
        '11-02': {
          _name: '11-02',
          active: [
            {
              from: 2020
            }
          ]
        },
        '12-24': {
          _name: '12-24'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        }
      }
    },
    LU: {
      names: {
        fr: 'Luxembourg',
        en: 'Luxembourg'
      },
      langs: [
        'fr'
      ],
      zones: [
        'Europe/Luxembourg'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        'easter -2': {
          _name: 'easter -2',
          type: 'observance'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01',
          name: {
            fr: '1er mai'
          }
        },
        '05-09': {
          _name: '05-09',
          active: [
            {
              from: '2019-01-01'
            }
          ]
        },
        'easter 39': {
          _name: 'easter 39'
        },
        'easter 50': {
          _name: 'easter 50'
        },
        '06-23': {
          name: {
            fr: 'L’anniversaire du Grand-Duc'
          }
        },
        '08-15': {
          _name: '08-15'
        },
        '11-01': {
          _name: '11-01'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        }
      }
    },
    LV: {
      names: {
        lv: 'Latvija',
        en: 'Latvia'
      },
      dayoff: 'sunday',
      langs: [
        'lv'
      ],
      zones: [
        'Europe/Riga'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01'
        },
        '05-04 and if saturday,sunday then next monday': {
          substitute: true,
          name: {
            en: 'Restoration of Independence day',
            lv: 'Latvijas Republikas Neatkarības atjaunošanas diena'
          }
        },
        '2nd sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        '06-23': {
          name: {
            en: 'Midsummer Eve',
            lv: 'Līgo Diena'
          }
        },
        '06-24': {
          name: {
            en: 'Midsummer',
            lv: 'Jāņi'
          }
        },
        '11-18 and if saturday,sunday then next monday': {
          substitute: true,
          name: {
            en: 'Republic Day',
            lv: 'Latvijas Republikas proklamēšanas diena'
          }
        },
        '12-24': {
          _name: '12-24'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        },
        '12-31': {
          _name: '12-31'
        }
      }
    },
    LY: {
      names: {
        ar: 'دولة ليبيا',
        en: 'Libya'
      },
      langs: [
        'ar'
      ],
      zones: [
        'Africa/Tripoli'
      ],
      dayoff: '',
      days: {
        '02-17': {
          _name: 'Revolution Day'
        },
        '05-01': {
          _name: '05-01'
        },
        '09-16': {
          name: {
            ar: 'يوم الشهداء',
            en: "Martyrs' Day"
          }
        },
        '10-23': {
          _name: 'Liberation Day'
        },
        '12-24': {
          _name: 'Independence Day'
        },
        '1 Muharram': {
          _name: '1 Muharram'
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal'
        },
        '1 Shawwal P3D': {
          _name: '1 Shawwal'
        },
        '9 Dhu al-Hijjah': {
          _name: '9 Dhu al-Hijjah'
        },
        '10 Dhu al-Hijjah P3D': {
          _name: '10 Dhu al-Hijjah'
        }
      }
    },
    MA: {
      names: {
        ar: 'المملكة المغربية',
        fr: 'Royaume du Maroc',
        en: 'Kingdom of Morocco'
      },
      langs: [
        'ar',
        'ber',
        'fr'
      ],
      zones: [
        'Africa/Casablanca'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-11': {
          name: {
            fr: "Manifeste de l'indépendance",
            ar: 'ذكرى تقديم وثيقة الاستقلال',
            en: 'Anniversary of the Independence Manifesto'
          }
        },
        '05-01': {
          _name: '05-01'
        },
        '07-30': {
          name: {
            fr: 'Fête du trône',
            ar: 'عيد العرش',
            en: 'Feast of the Throne'
          }
        },
        '08-14': {
          name: {
            fr: 'Journée de Oued Ed-Dahab',
            ar: 'يوم وادي الذهب',
            en: 'Anniversary of the Recovery Oued Ed-Dahab'
          }
        },
        '08-20': {
          name: {
            fr: 'Fête de la révolution du roi et du peuple',
            ar: 'ثورة الملك والشعب',
            en: 'Anniversary of the Revolution of the King and the People'
          }
        },
        '08-21': {
          name: {
            fr: 'Journée de la jeunesse',
            ar: 'عيد الشباب',
            en: 'Youth Day'
          }
        },
        '11-06': {
          name: {
            fr: 'La Marche verte',
            ar: 'المسيرة الخضراء',
            en: 'Anniversary of the Green March'
          }
        },
        '11-18': {
          _name: 'Independence Day',
          name: {
            fr: "Fête de l'indépendance"
          }
        },
        '1 Muharram': {
          _name: '1 Muharram'
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal'
        },
        '1 Shawwal': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah'
        }
      }
    },
    MC: {
      names: {
        fr: 'Monaco',
        en: 'Monaco'
      },
      dayoff: 'sunday',
      langs: [
        'fr'
      ],
      zones: [
        'Europe/Monaco'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-27 and if sunday then next monday': {
          substitute: true,
          name: {
            en: "Saint Devota's Day",
            fr: 'Sainte Dévote'
          }
        },
        'easter -2': {
          _name: 'easter -2',
          type: 'observance'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01 and if sunday then next monday': {
          substitute: true,
          _name: '05-01',
          name: {
            fr: '1er mai'
          }
        },
        'easter 39': {
          _name: 'easter 39'
        },
        'easter 50': {
          _name: 'easter 50'
        },
        'easter 60': {
          _name: 'easter 60'
        },
        '08-15': {
          _name: '08-15'
        },
        '11-01': {
          _name: '11-01'
        },
        '11-19 and if sunday then next monday': {
          substitute: true,
          name: {
            en: "H.S.H. the Sovereign Prince's Day",
            fr: 'La Fête du Prince'
          }
        },
        '12-08': {
          _name: '12-08'
        },
        '12-25 and if sunday then next monday': {
          substitute: true,
          _name: '12-25'
        }
      }
    },
    MD: {
      names: {
        ro: 'Republica Moldova',
        en: 'Moldova'
      },
      langs: [
        'ro'
      ],
      zones: [
        'Europe/Chisinau'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        'julian 12-25 P2D': {
          _name: 'julian 12-25',
          name: {
            ro: 'Craciun pe Rit Vechi'
          }
        },
        '03-08': {
          _name: '03-08'
        },
        orthodox: {
          _name: 'easter'
        },
        'orthodox 1': {
          _name: 'easter 1'
        },
        'orthodox 8': {
          name: {
            ro: 'Paştele Blăjinilor',
            en: 'Memorial Day'
          }
        },
        '05-01': {
          _name: '05-01'
        },
        '05-09': {
          name: {
            ro: 'Ziua Victoriei',
            en: 'Victory Day'
          }
        },
        '08-27': {
          _name: 'Independence Day'
        },
        '08-31': {
          name: {
            ro: 'Limba noastră',
            en: 'National Language Day'
          }
        },
        '1st saturday in October P2D': {
          name: {
            ro: 'Ziua vinului',
            en: 'Wine Day'
          },
          type: 'observance',
          active: [
            {
              from: 2013
            }
          ]
        },
        '12-25': {
          _name: '12-25',
          name: {
            ro: 'Craciun pe stil Nou'
          }
        }
      },
      states: {
        CA: {
          name: 'Cahul',
          days: {
            '11-21': {
              name: {
                ro: 'Ziua Cahul',
                en: 'Cahul Day'
              }
            }
          }
        },
        CU: {
          name: 'Chișinău',
          days: {
            '10-14': {
              name: {
                ro: 'Ziua capitalului',
                en: "Capital's Day"
              }
            }
          }
        }
      }
    },
    ME: {
      names: {
        hr: 'Crna Gora',
        sr: 'Црна Гора',
        bs: 'Crna Gora',
        sq: 'Mali i Zi',
        en: 'Montenegro'
      },
      dayoff: 'sunday',
      langs: [
        'hr',
        'sr',
        'bs',
        'sq'
      ],
      zones: [
        'Europe/Belgrade'
      ],
      days: {
        '05-21 and if sunday then next tuesday': {
          substitute: true,
          _name: 'Independence Day'
        },
        '05-22 and if sunday then next monday': {
          substitute: true,
          _name: 'Independence Day'
        },
        '07-13 and if sunday then next tuesday': {
          substitute: true,
          name: {
            hr: 'Dan državnosti',
            sr: 'Дан државности',
            en: 'Statehood Day'
          }
        },
        '07-14 and if sunday then next monday': {
          substitute: true,
          name: {
            hr: 'Dan državnosti',
            sr: 'Дан државности',
            en: 'Statehood Day'
          }
        },
        '01-01 and if sunday then next tuesday': {
          substitute: true,
          _name: '01-01'
        },
        '01-02 and if sunday then next monday': {
          substitute: true,
          _name: '01-01'
        },
        '05-01 and if sunday then next tuesday': {
          substitute: true,
          _name: '05-01'
        },
        '05-02 and if sunday then next monday': {
          substitute: true,
          _name: '05-01'
        },
        'julian 12-24': {
          _name: '12-24'
        },
        'julian 12-25': {
          _name: '12-25'
        },
        'julian 12-26': {
          _name: '12-26'
        },
        'julian 01-01': {
          _name: 'julian 01-01',
          type: 'observance'
        },
        'orthodox -2': {
          _name: 'easter -2'
        },
        orthodox: {
          _name: 'easter'
        },
        '12-24': {
          _name: '12-24'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-25'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter'
        },
        'easter 1': {
          _name: 'easter'
        },
        '08-15': {
          _name: '08-15',
          type: 'observance'
        },
        '11-01': {
          _name: '11-01'
        },
        '1 Shawwal P3D': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah P3D': {
          _name: '10 Dhu al-Hijjah'
        },
        '1 Muharram': {
          _name: '1 Muharram',
          type: 'observance'
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal',
          type: 'observance'
        },
        '27 Rajab': {
          _name: '27 Rajab',
          type: 'observance'
        },
        '15 Shaban': {
          _name: '15 Shaban',
          type: 'observance'
        },
        '1 Ramadan': {
          _name: '1 Ramadan',
          type: 'observance'
        },
        '27 Ramadan': {
          _name: '27 Ramadan',
          type: 'observance'
        },
        '15 Nisan P2D': {
          _name: '15 Nisan'
        },
        '1 Tishrei': {
          _name: '1 Tishrei',
          type: 'observance'
        },
        '10 Tishrei P2D': {
          _name: '10 Tishrei'
        }
      }
    },
    MF: {
      names: {
        en: 'St. Martin',
        fr: 'Saint Martin'
      },
      langs: [
        'fr'
      ],
      zones: [
        'America/Marigot'
      ],
      dayoff: 'sunday',
      _days: 'FR',
      days: {
        '05-27': {
          name: {
            fr: "Abolition de l'esclavage",
            en: 'abolition of slavery'
          }
        }
      }
    },
    MG: {
      names: {
        mg: "Repoblikan'i Madagasikara",
        fr: 'République de Madagascar',
        en: 'Madagascar'
      },
      dayoff: 'sunday',
      langs: [
        'mg',
        'fr',
        'en'
      ],
      zones: [
        'Africa/Nairobi'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '03-08': {
          name: {
            mg: "Andro iraisam-pirenena ho an'ny vehivavy",
            fr: 'Journée internationale de la femme',
            en: "International Women's Day"
          },
          note: 'only for women'
        },
        '03-29': {
          name: {
            mg: "Martioran'ny tolona tamin'ny 1947",
            fr: "Commémoration des martyrs de l'insurrection de 1947.",
            en: "Martyrs' Day"
          }
        },
        easter: {
          _name: 'easter'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01'
        },
        '05-25': {
          name: {
            mg: "Andron'i Afrika",
            fr: "Jour de l'Afrique",
            en: 'Africa Day'
          }
        },
        'easter 39': {
          _name: 'easter 39'
        },
        'easter 50': {
          _name: 'easter 50'
        },
        '06-26': {
          _name: 'Independence Day',
          name: {
            mg: 'Fetim-pirenena',
            fr: 'Fête Nationale'
          }
        },
        '08-15': {
          _name: '08-15'
        },
        '11-01': {
          _name: '11-01'
        },
        '12-25': {
          _name: '12-25'
        },
        '1 Shawwal': {
          _name: '1 Shawwal',
          note: 'For Muslim'
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah',
          note: 'For Muslim'
        }
      }
    },
    MK: {
      names: {
        mk: 'Република Македонија',
        en: 'Macedonia'
      },
      langs: [
        'mk'
      ],
      zones: [
        'Europe/Belgrade'
      ],
      dayoff: 'sunday',
      days: {
        '01-01 and if sunday then next monday': {
          substitute: true,
          _name: '01-01'
        },
        'julian 12-25 and if sunday then next monday': {
          substitute: true,
          _name: 'julian 12-25'
        },
        orthodox: {
          _name: 'orthodox'
        },
        'orthodox 1': {
          _name: 'orthodox 1'
        },
        '05-01 and if sunday then next monday': {
          substitute: true,
          _name: '05-01'
        },
        '05-24 and if sunday then next monday': {
          substitute: true,
          name: {
            mk: 'Св. Кирил и Методиј',
            en: 'Saints Cyril and Methodius Day'
          }
        },
        '08-02 and if sunday then next monday': {
          substitute: true,
          name: {
            mk: 'Ден на Републиката',
            en: 'Day of the Republic'
          }
        },
        '09-08 and if sunday then next monday': {
          substitute: true,
          _name: 'Independence Day'
        },
        '10-11 and if sunday then next monday': {
          substitute: true,
          name: {
            mk: 'Ден на востанието',
            en: 'Revolution Day'
          }
        },
        '10-23 and if sunday then next monday': {
          substitute: true,
          name: {
            mk: 'Ден на македонската револуционерна борба',
            en: 'Day of the Macedonian Revolutionary Struggle'
          }
        },
        '12-08 and if sunday then next monday': {
          substitute: true,
          name: {
            mk: 'Св. Климент Охридски',
            en: 'Saint Clement of Ohrid Day'
          }
        },
        '1 Shawwal and if sunday then next monday': {
          substitute: true,
          _name: '1 Shawwal'
        },
        'julian 12-24': {
          _name: 'julian 12-24',
          type: 'optional',
          note: 'Orthodox believers'
        },
        'julian 01-06': {
          _name: '01-06',
          type: 'optional',
          note: 'Orthodox believers'
        },
        'orthodox -2': {
          _name: 'orthodox -2',
          type: 'optional',
          note: 'Orthodox believers'
        },
        'orthodox 47': {
          name: {
            mk: 'петок пред Духовден',
            en: 'Friday before Pentecost'
          },
          type: 'optional',
          note: 'Orthodox believers'
        },
        'orthodox 49': {
          _name: 'easter 49',
          type: 'optional',
          note: 'Orthodox believers'
        },
        'julian 08-15': {
          _name: '08-15',
          type: 'optional',
          note: 'Orthodox believers'
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah',
          type: 'optional',
          note: 'Muslim believers'
        },
        '10 Tishrei': {
          _name: '10 Tishrei',
          type: 'optional',
          note: 'Jewish believers'
        },
        'easter 1': {
          _name: 'easter 1',
          type: 'optional',
          note: 'Catholic believers'
        },
        '11-01': {
          _name: '11-01',
          type: 'optional',
          note: 'Catholic believers'
        },
        '12-25': {
          _name: '12-25',
          type: 'optional',
          note: 'Catholic believers'
        },
        '11-22': {
          name: {
            mk: 'Ден на Албанската азбука',
            en: 'Day of the Albanian Alphabet'
          },
          type: 'optional',
          note: 'For members of the Albanian community'
        },
        '12-21': {
          name: {
            mk: 'Ден на настава на турски јазик',
            en: 'Turkish Language Day'
          },
          type: 'optional',
          note: 'For members of the the Turkish community'
        },
        '01-27': {
          name: {
            mk: 'Свети Сава',
            en: 'St. Sava'
          },
          type: 'optional',
          note: 'For members of the Serbian community'
        },
        '04-08': {
          name: {
            mk: 'Меѓународен ден на Ромите',
            en: 'International Roma Day'
          },
          type: 'optional',
          note: 'For members of the the Roma community'
        },
        '05-23': {
          name: {
            mk: 'Национален ден на Властите',
            en: 'National Day of Authorities'
          },
          type: 'optional',
          note: 'For members of the Vlach community'
        },
        '09-28': {
          name: {
            mk: 'Меѓународен ден на Бошњаците',
            en: 'International Day of Bosniaks'
          },
          type: 'optional',
          note: 'For Members of the Bosniak community.'
        }
      }
    },
    ML: {
      names: {
        fr: 'République du Mali',
        en: 'Republic of Mali'
      },
      langs: [
        'fr',
        'en'
      ],
      zones: [
        'Africa/Abidjan'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-20': {
          name: {
            fr: "Fête de l'armée",
            en: 'Army Day'
          }
        },
        '03-26': {
          name: {
            fr: 'Journée des Martyrs',
            en: "Martyrs' Day"
          }
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01'
        },
        '12-25': {
          _name: '12-25'
        },
        '1 Shawwal': {
          _name: '1 Shawwal'
        },
        '05-25': {
          name: "Jour de l'Afrique"
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah'
        },
        '09-22': {
          _name: 'Independence Day',
          name: {
            fr: "Fête nationale de l'indépendance"
          }
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal'
        }
      }
    },
    MQ: {
      names: {
        fr: 'Martinique',
        en: 'Martinique'
      },
      langs: [
        'fr'
      ],
      zones: [
        'America/Martinique'
      ],
      dayoff: 'sunday',
      _days: 'FR',
      days: {
        'easter -2': {
          _name: 'easter -2'
        },
        '05-22': {
          _name: 'Abolition of Slavery'
        },
        '07-21': {
          name: {
            fr: 'Jour de Victor Schoelcher',
            en: 'Victor Shoelcher Day'
          }
        }
      }
    },
    MR: {
      names: {
        ar: 'الجمهورية الإسلامية الموريتانية',
        en: 'Mauritania'
      },
      langs: [
        'ar',
        'fr'
      ],
      zones: [
        'Africa/Abidjan'
      ],
      dayoff: '',
      days: {
        '01-01': {
          _name: '01-01'
        },
        '05-01': {
          _name: '05-01'
        },
        '05-25': {
          name: {
            ar: 'يوم افريقيا',
            en: 'Africa Day'
          }
        },
        '11-28': {
          _name: 'Independence Day'
        },
        '1 Muharram': {
          _name: '1 Muharram'
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal'
        },
        '1 Shawwal': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah P3D': {
          _name: '10 Dhu al-Hijjah'
        }
      }
    },
    MS: {
      names: {
        en: 'Montserrat'
      },
      langs: [
        'en'
      ],
      zones: [
        'America/Port_of_Spain'
      ],
      dayoff: 'sunday',
      days: {
        '01-01 and if Saturday then next Monday if Sunday then next Tuesday': {
          substitute: true,
          _name: '01-01'
        },
        '03-17 and if Saturday, Sunday then next Monday': {
          substitute: true,
          name: {
            en: "Saint Patrick's Day"
          }
        },
        'easter -2': {
          _name: 'easter -2'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '1st Monday in May': {
          _name: '05-01'
        },
        'easter 50': {
          _name: 'easter 50'
        },
        '2nd Monday after 06-02': {
          name: {
            en: "Queen's Birthday Celebration"
          }
        },
        '08-01 if Saturday, Sunday then next Monday': {
          name: {
            en: 'Emancipation Day'
          }
        },
        '12-25 and if Saturday then next Monday if Sunday then next Tuesday': {
          substitute: true,
          _name: '12-25'
        },
        '12-26 and if Saturday then next Monday if Sunday then next Tuesday': {
          substitute: true,
          _name: '12-26'
        },
        '12-31 and if Saturday then next Monday if Sunday then next Tuesday': {
          substitute: true,
          _name: '12-31',
          name: {
            en: 'Festival Day'
          }
        }
      }
    },
    MT: {
      names: {
        mt: 'Malta',
        en: 'Malta'
      },
      dayoff: 'sunday',
      langs: [
        'mt'
      ],
      zones: [
        'Europe/Malta'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '02-10': {
          name: {
            en: "Feast of Saint Paul's Shipwreck in Malta",
            mt: "Nawfraġju ta' San Pawl"
          }
        },
        '03-19': {
          _name: '03-19'
        },
        '03-31': {
          name: {
            en: 'Freedom Day',
            mt: 'Jum il-Ħelsien'
          }
        },
        'easter -2': {
          _name: 'easter -2'
        },
        '05-01': {
          _name: '05-01'
        },
        '06-07': {
          name: {
            mt: 'Sette Giugno',
            en: 'June 7th'
          }
        },
        '06-29': {
          _name: '06-29'
        },
        '08-15': {
          _name: '08-15'
        },
        '09-08': {
          name: {
            en: 'Victory Day',
            mt: 'Jum il-Vitorja'
          }
        },
        '09-21': {
          _name: 'Independence Day'
        },
        '12-08': {
          _name: '12-08'
        },
        '12-13': {
          name: {
            en: 'Republic Day',
            mt: 'Jum ir-Repubblika'
          }
        },
        '12-25': {
          _name: '12-25'
        }
      }
    },
    MW: {
      names: {
        en: 'Malawi'
      },
      dayoff: 'sunday',
      langs: [
        'en'
      ],
      zones: [
        'Africa/Maputo'
      ],
      days: {
        '01-01 and if saturday,sunday then next monday': {
          substitute: true,
          _name: '01-01'
        },
        '01-15 and if saturday,sunday then next monday': {
          substitute: true,
          name: {
            en: 'John Chilembwe Day'
          }
        },
        '03-03 and if saturday,sunday then next monday': {
          name: {
            en: "Martyrs' Day"
          }
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01 and if saturday,sunday then next monday': {
          _name: '05-01'
        },
        '05-14 and if saturday,sunday then next monday': {
          substitute: true,
          name: {
            en: 'Kamuzu Day'
          }
        },
        '07-06 and if saturday,sunday then next monday': {
          substitute: true,
          _name: 'Independence Day'
        },
        '10-15 and if saturday,sunday then next monday': {
          substitute: true,
          _name: 'Mothers Day'
        },
        '12-25 and if saturday,sunday then next monday': {
          substitute: true,
          _name: '12-25'
        },
        '1 Shawwal and if saturday,sunday then next monday': {
          substitute: true,
          _name: '1 Shawwal',
          name: {
            en: 'Eid al Fitri'
          }
        }
      }
    },
    MX: {
      names: {
        es: 'México',
        en: 'Mexico'
      },
      dayoff: 'sunday',
      langs: [
        'es'
      ],
      zones: [
        'America/Mexico_City',
        'America/Cancun',
        'America/Merida',
        'America/Monterrey',
        'America/Matamoros',
        'America/Mazatlan',
        'America/Chihuahua',
        'America/Ojinaga',
        'America/Hermosillo',
        'America/Tijuana',
        'America/Santa_Isabel',
        'America/Bahia_Banderas'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '02-05': {
          _name: 'Constitution Day'
        },
        '1st monday in February': {
          name: {
            en: 'Constitution Day (day off)',
            es: 'Día de la Constitución (día libre)'
          }
        },
        '03-21': {
          name: {
            en: "Benito Juárez's birthday",
            es: 'Natalicio de Benito Juárez'
          }
        },
        '3rd monday in March': {
          name: {
            en: "Benito Juárez's birthday (day off)",
            es: 'Natalicio de Benito Juárez (día libre)'
          }
        },
        'easter -3': {
          _name: 'easter -3',
          type: 'bank'
        },
        'easter -2': {
          _name: 'easter -2',
          type: 'bank'
        },
        '05-01': {
          _name: '05-01'
        },
        '05-10': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        '09-16': {
          _name: 'Independence Day'
        },
        '11-02': {
          _name: '11-02',
          type: 'bank'
        },
        '11-20': {
          _name: 'Revolution Day'
        },
        '3rd monday in November': {
          name: {
            en: 'Revolution Day (day off)',
            es: 'Día de la Revolución (día libre)'
          }
        },
        '12-01 every 6 years since 1934': {
          name: {
            en: 'Change of Federal Government',
            es: 'Transmisión del Poder Ejecutivo Federal'
          }
        },
        '12-12': {
          name: {
            en: 'Day of the Virgin of Guadalupe',
            es: 'Día de la Virgen de Guadalupe'
          },
          type: 'bank'
        },
        '12-25': {
          _name: '12-25'
        }
      }
    },
    MY: {
      names: {
        en: 'Malaysia'
      },
      langs: [
        'ms'
      ],
      zones: [
        'Asia/Kuala_Lumpur',
        'Asia/Kuching'
      ],
      dayoff: 'Saturday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        'substitutes 01-01 if Sunday then next Monday': {
          substitute: true,
          _name: '01-01'
        },
        'chinese 01-0-01': {
          name: {
            en: 'Chinese New Year',
            ms: 'Tahun Baru Cina'
          }
        },
        'chinese 01-0-02': {
          name: {
            en: 'Chinese New Year',
            ms: 'Tahun Baru Cina'
          }
        },
        'substitutes chinese 01-0-01 if Sunday then next Monday': {
          substitute: true,
          name: {
            en: 'Chinese New Year',
            ms: 'Tahun Baru Cina'
          }
        },
        'substitutes chinese 01-0-02 if Sunday then next Monday': {
          substitute: true,
          name: {
            en: 'Chinese New Year',
            ms: 'Tahun Baru Cina'
          }
        },
        '05-01': {
          _name: '05-01'
        },
        'substitutes 05-01 if Sunday then next Monday': {
          substitute: true,
          _name: '05-01'
        },
        '1st Monday in June': {
          name: {
            en: "Yang di-Pertuan Agong's Birthday",
            ms: 'Hari Keputeraan Yang di-Pertuan Agong'
          }
        },
        '08-31': {
          _name: 'Independence Day'
        },
        'substitutes 08-31 if Sunday then next Monday': {
          substitute: true,
          _name: 'Independence Day'
        },
        '09-16': {
          name: {
            en: 'Malaysia Day',
            ms: 'Hari Malaysia'
          }
        },
        'substitutes 09-16 if Sunday then next Monday': {
          substitute: true,
          name: {
            en: 'Malaysia Day',
            ms: 'Hari Malaysia'
          }
        },
        '12-25': {
          _name: '12-25'
        },
        'substitutes 12-25 if Sunday then next Monday': {
          substitute: true,
          _name: '12-25'
        },
        '17 Ramadan': {
          _name: '17 Ramadan',
          disable: [
            '2022-04-18'
          ],
          enable: [
            '2022-04-19'
          ]
        },
        '1 Shawwal': {
          _name: '1 Shawwal',
          disable: [
            '2022-05-02'
          ],
          enable: [
            '2022-05-03'
          ]
        },
        '2 Shawwal': {
          _name: '1 Shawwal',
          disable: [
            '2022-05-03'
          ],
          enable: [
            '2022-05-04'
          ]
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah',
          disable: [
            '2022-07-09'
          ],
          enable: [
            '2022-07-10'
          ]
        },
        '1 Muharram': {
          _name: '1 Muharram'
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal',
          disable: [
            '2022-10-08'
          ],
          enable: [
            '2022-10-09'
          ]
        },
        '2010-05-28': {
          _name: 'Vesak'
        },
        '2011-05-17': {
          _name: 'Vesak'
        },
        '2012-05-06': {
          _name: 'Vesak'
        },
        '2013-05-25': {
          _name: 'Vesak'
        },
        '2014-05-15': {
          _name: 'Vesak'
        },
        '2015-06-02': {
          _name: 'Vesak'
        },
        '2016-05-22': {
          _name: 'Vesak'
        },
        '2017-05-10': {
          _name: 'Vesak'
        },
        '2018-05-29': {
          _name: 'Vesak'
        },
        '2019-05-19': {
          _name: 'Vesak'
        },
        '2020-05-07': {
          _name: 'Vesak'
        },
        '2021-05-26': {
          _name: 'Vesak'
        },
        '2022-05-15': {
          _name: 'Vesak'
        },
        '2022-05-16': {
          substitute: true,
          _name: 'Vesak'
        },
        '2023-05-04': {
          _name: 'Vesak'
        },
        '2024-05-22': {
          _name: 'Vesak'
        },
        '2025-05-12': {
          _name: 'Vesak'
        },
        '2026-05-31': {
          _name: 'Vesak'
        },
        '2016-10-29': {
          _name: 'Deepavali'
        },
        '2017-10-18': {
          _name: 'Deepavali'
        },
        '2018-11-06': {
          _name: 'Deepavali'
        },
        '2019-10-27': {
          _name: 'Deepavali'
        },
        '2019-10-28': {
          substitute: true,
          _name: 'Deepavali'
        },
        '2020-11-14': {
          _name: 'Deepavali'
        },
        '2021-11-04': {
          _name: 'Deepavali'
        },
        '2022-10-24': {
          _name: 'Deepavali'
        },
        '2023-11-12': {
          _name: 'Deepavali'
        },
        '2023-11-13': {
          substitute: true,
          _name: 'Deepavali'
        },
        '2024-10-31': {
          _name: 'Deepavali'
        },
        '2025-10-20': {
          _name: 'Deepavali'
        },
        '2026-11-09': {
          _name: 'Deepavali'
        },
        '2027-10-28': {
          _name: 'Deepavali'
        },
        '2028-11-15': {
          _name: 'Deepavali'
        },
        '2029-11-05': {
          _name: 'Deepavali'
        },
        '2030-10-25': {
          _name: 'Deepavali'
        }
      },
      states: {
        10: {
          name: 'Selangor',
          days: {
            '12-11': {
              name: {
                en: "Sultan of Selangor's Birthday",
                id: 'Hari Keputeraan Sultan Selangor'
              }
            },
            '2016-01-24': {
              _name: 'Thaipusam'
            },
            '2017-02-10': {
              _name: 'Thaipusam'
            },
            '2018-01-31': {
              _name: 'Thaipusam'
            },
            '2019-01-21': {
              _name: 'Thaipusam'
            },
            '2020-02-08': {
              _name: 'Thaipusam'
            },
            '2021-01-28': {
              _name: 'Thaipusam'
            },
            '2022-01-18': {
              _name: 'Thaipusam'
            },
            '2023-02-05': {
              _name: 'Thaipusam'
            },
            '2024-01-25': {
              _name: 'Thaipusam'
            },
            '2025-02-11': {
              _name: 'Thaipusam'
            },
            '2026-02-01': {
              _name: 'Thaipusam'
            }
          }
        },
        11: {
          name: 'Terengganu',
          days: {
            '01-01': false,
            '03-04': {
              name: {
                en: 'Anniversary of Installation of the Sultan of Terengganu',
                ms: 'Hari Ulang Tahun Pertabalan Sultan Terengganu'
              }
            },
            '04-26': {
              name: {
                en: "Sultan of Terengganu's Birthday",
                ms: 'Hari Keputeraan Sultan Terengganu'
              }
            },
            '27 Rajab': {
              _name: '27 Rajab'
            },
            '9 Dhu al-Hijjah': {
              _name: '9 Dhu al-Hijjah'
            },
            '11 Dhu al-Hijjah': {
              _name: '10 Dhu al-Hijjah'
            }
          }
        },
        12: {
          name: 'Sabah',
          days: {
            'easter -2': {
              _name: 'easter -2'
            },
            '05-30': {
              name: {
                en: 'Tadau Kaamatan',
                ms: 'Pesta Kaamatan'
              }
            },
            '05-31': {
              name: {
                en: 'Tadau Kaamatan',
                ms: 'Pesta Kaamatan'
              }
            },
            '1st Saturday in October': {
              name: {
                en: "Sabah State Governor's Birthday",
                ms: 'Hari Jadi Yang di-Pertua Negeri Sabah'
              }
            },
            '12-24': {
              _name: '12-24'
            },
            '17 Ramadan': false
          }
        },
        13: {
          name: 'Sarawak',
          days: {
            '2016-10-29': false,
            '2017-10-18': false,
            '2018-11-06': false,
            '2019-10-27': false,
            '2020-11-14': false,
            '2021-11-04': false,
            '2022-10-24': false,
            '2023-11-13': false,
            '2024-10-31': false,
            '2025-10-20': false,
            '2026-11-09': false,
            '2027-10-28': false,
            '2028-11-15': false,
            '2029-11-05': false,
            '2030-10-25': false,
            'easter -2': {
              _name: 'easter -2'
            },
            '06-01': {
              name: {
                en: 'Gawai Dayak',
                ms: 'Perayaan Hari Gawai Dayak'
              }
            },
            '06-02': {
              name: {
                en: 'Gawai Dayak',
                ms: 'Perayaan Hari Gawai Dayak'
              }
            },
            '07-22': {
              name: {
                en: 'Sarawak Independence Day',
                ms: 'Hari Kemerdekaan Sarawak'
              }
            },
            '2nd Saturday in October': {
              name: {
                en: "Sarawak State Governor's Birthday",
                ms: 'Hari Jadi Yang di-Pertua Negeri Sarawak'
              }
            },
            '17 Ramadan': false
          }
        },
        14: {
          name: 'Kuala Lumpur',
          days: {
            '02-01': {
              name: {
                en: 'Federal Territory Day',
                ms: 'Hari Wilayah Persekutuan'
              }
            },
            '2016-01-24': {
              _name: 'Thaipusam'
            },
            '2017-02-10': {
              _name: 'Thaipusam'
            },
            '2018-01-31': {
              _name: 'Thaipusam'
            },
            '2019-01-21': {
              _name: 'Thaipusam'
            },
            '2020-02-08': {
              _name: 'Thaipusam'
            },
            '2021-01-28': {
              _name: 'Thaipusam'
            },
            '2022-01-18': {
              _name: 'Thaipusam'
            },
            '2023-02-05': {
              _name: 'Thaipusam'
            },
            '2024-01-25': {
              _name: 'Thaipusam'
            },
            '2025-02-11': {
              _name: 'Thaipusam'
            },
            '2026-02-01': {
              _name: 'Thaipusam'
            }
          }
        },
        15: {
          name: 'Labuan',
          days: {
            '02-01': {
              name: {
                en: 'Federal Territory Day',
                ms: 'Hari Wilayah Persekutuan'
              }
            },
            '05-30': {
              name: {
                en: 'Tadau Kaamatan',
                ms: 'Pesta Kaamatan'
              }
            },
            '05-31': {
              name: {
                en: 'Tadau Kaamatan',
                ms: 'Pesta Kaamatan'
              }
            }
          }
        },
        16: {
          name: 'Putrajaya',
          days: {
            '02-01': {
              name: {
                en: 'Federal Territory Day',
                ms: 'Hari Wilayah Persekutuan'
              }
            },
            '2016-01-24': {
              _name: 'Thaipusam'
            },
            '2017-02-10': {
              _name: 'Thaipusam'
            },
            '2018-01-31': {
              _name: 'Thaipusam'
            },
            '2019-01-21': {
              _name: 'Thaipusam'
            },
            '2020-02-08': {
              _name: 'Thaipusam'
            },
            '2021-01-28': {
              _name: 'Thaipusam'
            },
            '2022-01-18': {
              _name: 'Thaipusam'
            },
            '2023-02-05': {
              _name: 'Thaipusam'
            },
            '2024-01-25': {
              _name: 'Thaipusam'
            },
            '2025-02-11': {
              _name: 'Thaipusam'
            },
            '2026-02-01': {
              _name: 'Thaipusam'
            }
          }
        },
        '01': {
          name: 'Johor',
          days: {
            '01-01': false,
            '03-23': {
              name: {
                en: "Sultan of Johor's Birthday",
                ms: 'Hari Keputeraan Sultan Johor'
              }
            },
            '1 Ramadan': {
              _name: '1 Ramadan'
            },
            '17 Ramadan': false,
            '6 Safar': {
              name: {
                en: 'Hari Hol of Sultan Iskandar of Johor',
                ms: 'Hari Hol Almarhum Sultan Iskandar'
              }
            },
            '2016-01-24': {
              _name: 'Thaipusam'
            },
            '2017-02-10': {
              _name: 'Thaipusam'
            },
            '2018-01-31': {
              _name: 'Thaipusam'
            },
            '2019-01-21': {
              _name: 'Thaipusam'
            },
            '2020-02-08': {
              _name: 'Thaipusam'
            },
            '2021-01-28': {
              _name: 'Thaipusam'
            },
            '2022-01-18': {
              _name: 'Thaipusam'
            },
            '2023-02-05': {
              _name: 'Thaipusam'
            },
            '2024-01-25': {
              _name: 'Thaipusam'
            },
            '2025-02-11': {
              _name: 'Thaipusam'
            },
            '2026-02-01': {
              _name: 'Thaipusam'
            }
          }
        },
        '02': {
          name: 'Kedah',
          days: {
            '01-01': false,
            '3rd Sunday in June': {
              name: {
                en: "Sultan of Kedah's Birthday",
                ms: 'Hari Keputeraan Sultan Kedah'
              }
            },
            '27 Rajab': {
              _name: '27 Rajab'
            },
            '1 Ramadan': {
              _name: '1 Ramadan'
            },
            '17 Ramadan': false,
            '11 Dhu al-Hijjah': {
              _name: '10 Dhu al-Hijjah'
            },
            '2016-01-24': {
              _name: 'Thaipusam'
            },
            '2017-02-10': {
              _name: 'Thaipusam'
            },
            '2018-01-31': {
              _name: 'Thaipusam'
            },
            '2019-01-21': {
              _name: 'Thaipusam'
            },
            '2020-02-08': {
              _name: 'Thaipusam'
            },
            '2021-01-28': {
              _name: 'Thaipusam'
            },
            '2022-01-18': {
              _name: 'Thaipusam'
            },
            '2023-02-05': {
              _name: 'Thaipusam'
            },
            '2024-01-25': {
              _name: 'Thaipusam'
            },
            '2025-02-11': {
              _name: 'Thaipusam'
            },
            '2026-02-01': {
              _name: 'Thaipusam'
            }
          }
        },
        '03': {
          name: 'Kelantan',
          days: {
            '01-01': false,
            '11 Dhu al-Hijjah': {
              _name: '10 Dhu al-Hijjah'
            },
            '11-11': {
              name: {
                en: "Sultan of Kelantan's Birthday",
                ms: 'Hari Keputeraan Sultan Kelantan'
              }
            },
            '11-12': {
              name: {
                en: "Sultan of Kelantan's Birthday",
                ms: 'Hari Keputeraan Sultan Kelantan'
              }
            }
          }
        },
        '04': {
          name: 'Malacca',
          days: {
            '04-15': {
              name: {
                en: 'Declaration of Malacca City as Historical City',
                ms: 'Hari Perisytiharan Bandar Melaka sebagai Bandaraya Bersejarah'
              }
            },
            '08-24': {
              name: {
                en: "Melaka State Governor's Birthday",
                ms: 'Hari Jadi Yang di-Pertua Negeri Melaka'
              }
            },
            '1 Ramadan': {
              _name: '1 Ramadan'
            },
            '17 Ramadan': false
          }
        },
        '05': {
          name: 'Negeri Sembilan',
          days: {
            '01-14': {
              name: {
                en: "Yang di-Pertuan Besar of Negeri Sembilan's Birthday",
                ms: 'Hari Keputeraan Yang di-Pertuan Besar Negeri Sembilan'
              }
            },
            '27 Rajab': {
              _name: '27 Rajab'
            },
            '17 Ramadan': false,
            '2016-01-24': {
              _name: 'Thaipusam'
            },
            '2017-02-10': {
              _name: 'Thaipusam'
            },
            '2018-01-31': {
              _name: 'Thaipusam'
            },
            '2019-01-21': {
              _name: 'Thaipusam'
            },
            '2020-02-08': {
              _name: 'Thaipusam'
            },
            '2021-01-28': {
              _name: 'Thaipusam'
            },
            '2022-01-18': {
              _name: 'Thaipusam'
            },
            '2023-02-05': {
              _name: 'Thaipusam'
            },
            '2024-01-25': {
              _name: 'Thaipusam'
            },
            '2025-02-11': {
              _name: 'Thaipusam'
            },
            '2026-02-01': {
              _name: 'Thaipusam'
            }
          }
        },
        '06': {
          name: 'Pahang',
          days: {
            '05-22': {
              name: {
                en: 'Hari Hol of Pahang',
                ms: 'Hari Hol Pahang'
              }
            },
            '07-30': {
              name: {
                en: "Sultan of Pahang's Birthday",
                ms: 'Hari Keputeraan Sultan Pahang'
              }
            }
          }
        },
        '07': {
          name: 'Penang',
          days: {
            '07-07': {
              name: {
                en: 'Declaration of George Town as World Heritage Site',
                id: 'Hari Ulang Tahun Perisytiharan Tapak Warisan Dunia'
              }
            },
            '2nd Saturday in July': {
              name: {
                en: "Penang State Governor's Birthday",
                ms: 'Hari Jadi Yang di-Pertua Negeri Pulau Pinang'
              }
            },
            '2016-01-24': {
              _name: 'Thaipusam'
            },
            '2017-02-10': {
              _name: 'Thaipusam'
            },
            '2018-01-31': {
              _name: 'Thaipusam'
            },
            '2019-01-21': {
              _name: 'Thaipusam'
            },
            '2020-02-08': {
              _name: 'Thaipusam'
            },
            '2021-01-28': {
              _name: 'Thaipusam'
            },
            '2022-01-18': {
              _name: 'Thaipusam'
            },
            '2023-02-05': {
              _name: 'Thaipusam'
            },
            '2024-01-25': {
              _name: 'Thaipusam'
            },
            '2025-02-11': {
              _name: 'Thaipusam'
            },
            '2026-02-01': {
              _name: 'Thaipusam'
            }
          }
        },
        '08': {
          name: 'Perak',
          days: {
            '1st Friday in November': {
              name: {
                en: "Sultan of Perak's Birthday",
                ms: 'Hari Keputeraan Sultan Perak'
              }
            },
            '2016-01-24': {
              _name: 'Thaipusam'
            },
            '2017-02-10': {
              _name: 'Thaipusam'
            },
            '2018-01-31': {
              _name: 'Thaipusam'
            },
            '2019-01-21': {
              _name: 'Thaipusam'
            },
            '2020-02-08': {
              _name: 'Thaipusam'
            },
            '2021-01-28': {
              _name: 'Thaipusam'
            },
            '2022-01-18': {
              _name: 'Thaipusam'
            },
            '2023-02-05': {
              _name: 'Thaipusam'
            },
            '2024-01-25': {
              _name: 'Thaipusam'
            },
            '2025-02-11': {
              _name: 'Thaipusam'
            },
            '2026-02-01': {
              _name: 'Thaipusam'
            }
          }
        },
        '09': {
          name: 'Perlis',
          days: {
            '01-01': false,
            '07-17': {
              name: {
                en: "Raja of Perlis's Birthday",
                id: 'Hari Keputeraan Raja Perlis'
              }
            },
            '27 Rajab': {
              _name: '27 Rajab'
            },
            '11 Dhu al-Hijjah': {
              _name: '10 Dhu al-Hijjah'
            }
          }
        }
      }
    },
    MZ: {
      names: {
        pt: 'Moçambique',
        en: 'Mozambique'
      },
      dayoff: 'sunday',
      langs: [
        'pt'
      ],
      zones: [
        'Africa/Maputo'
      ],
      days: {
        '01-01': {
          _name: '01-01',
          name: {
            pt: 'Dia da Fraternidade universal'
          }
        },
        'substitutes 01-01 if sunday then next monday': {
          _name: 'Public Holiday'
        },
        '02-03': {
          name: {
            pt: 'Dia dos heróis moçambicanos',
            en: 'Heroes’ Day'
          }
        },
        'substitutes 02-03 if sunday then next monday': {
          _name: 'Public Holiday'
        },
        '04-07': {
          name: {
            pt: 'Dia da Mulher Moçambicana',
            en: 'Women’s Day'
          }
        },
        'substitutes 04-07 if sunday then next monday': {
          _name: 'Public Holiday'
        },
        '05-01': {
          _name: '05-01',
          name: {
            pt: 'Dia Internacional dos Trabalhadores',
            en: "Workers' Day"
          }
        },
        'substitutes 05-01 if sunday then next monday': {
          _name: 'Public Holiday'
        },
        '1st sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        '06-25': {
          _name: 'Independence Day',
          name: {
            pt: 'Dia da Independência Nacional'
          }
        },
        'substitutes 06-25 if sunday then next monday': {
          _name: 'Public Holiday'
        },
        '09-07': {
          name: {
            pt: 'Dia da Vitória',
            en: 'Lusaka Peace Agreement'
          }
        },
        'substitutes 09-07 if sunday then next monday': {
          _name: 'Public Holiday'
        },
        '09-25': {
          name: {
            pt: 'Dia das Forças Armadas de Libertação Nacional',
            en: 'Defense Force’s Day'
          }
        },
        'substitutes 09-25 if sunday then next monday': {
          _name: 'Public Holiday'
        },
        '10-04': {
          name: {
            pt: 'Dia da Paz e Reconciliação',
            en: 'Peace and Reconciliation Day'
          }
        },
        'substitutes 10-04 if sunday then next monday': {
          _name: 'Public Holiday'
        },
        '12-25': {
          _name: '12-25',
          name: {
            pt: 'Dia da Família',
            en: 'Family Day'
          }
        },
        'substitutes 12-25 if sunday then next monday': {
          _name: 'Public Holiday'
        }
      }
    },
    NA: {
      names: {
        en: 'Namibia'
      },
      dayoff: 'sunday',
      langs: [
        'en'
      ],
      zones: [
        'Africa/Windhoek'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        'substitutes 01-01 if sunday then next monday': {
          name: 'Public Holiday'
        },
        '03-21': {
          _name: 'Independence Day'
        },
        'substitutes 03-21 if sunday then next monday': {
          name: 'Public Holiday'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01',
          name: {
            en: 'Workers Day'
          }
        },
        'substitutes 05-01 if sunday then next monday': {
          name: 'Public Holiday'
        },
        '05-04': {
          name: {
            en: 'Cassinga Day'
          }
        },
        'substitutes 05-04 if sunday then next monday': {
          name: 'Public Holiday'
        },
        'easter 39': {
          _name: 'easter 39'
        },
        '05-25': {
          name: {
            en: 'Africa Day'
          }
        },
        'substitutes 05-25 if sunday then next monday': {
          name: 'Public Holiday'
        },
        '08-26': {
          name: {
            en: "Heroes' Day"
          }
        },
        'substitutes 08-26 if sunday then next monday': {
          name: 'Public Holiday'
        },
        '12-10': {
          name: {
            en: 'Human Rights Day'
          }
        },
        'substitutes 12-10 if sunday then next monday': {
          name: 'Public Holiday'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26',
          name: {
            en: 'Day of Goodwill'
          }
        },
        'substitutes 12-26 if sunday then next monday': {
          name: 'Public Holiday'
        }
      }
    },
    NC: {
      names: {
        fr: 'Nouvelle-Calédonie',
        en: 'New Caledonia'
      },
      dayoff: 'sunday',
      zones: [
        'Pacific/Noumea'
      ],
      langs: [
        'fr'
      ],
      _days: 'FR',
      days: {
        '01-01': {
          name: {
            fr: "Jour de l'an"
          }
        },
        '09-24': {
          name: {
            fr: 'Fête de la Citonneyeté',
            en: 'New Caledonia Day'
          }
        }
      }
    },
    NE: {
      names: {
        fr: 'République du Niger',
        en: 'Republic of the Niger'
      },
      langs: [
        'fr'
      ],
      zones: [
        'Africa/Lagos'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        '04-24': {
          name: {
            fr: 'Journée Nationale de la Concorde',
            en: 'Concord Day'
          }
        },
        '05-01': {
          _name: '05-01'
        },
        '08-03': {
          _name: 'Independence Day',
          name: {
            fr: "Proclamation de l'indépendance"
          }
        },
        '12-18': {
          name: {
            fr: 'Proclamation de la République',
            en: 'Republic Day'
          }
        },
        '12-25': {
          _name: '12-25'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '1 Shawwal': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah'
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal'
        },
        '1 Muharram': {
          _name: '1 Muharram'
        },
        '27 Ramadan': {
          _name: '27 Ramadan'
        }
      }
    },
    NG: {
      names: {
        en: 'Nigeria'
      },
      langs: [
        'en'
      ],
      zones: [
        'Africa/Lagos'
      ],
      dayoff: 'Saturday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        '05-01 and if Saturday then next Monday': {
          substitute: true,
          _name: '05-01',
          name: {
            en: "Worker's Day"
          }
        },
        '05-27': {
          name: {
            en: "Children's Day",
            type: 'school'
          }
        },
        '05-29 prior to 2018': {
          name: {
            en: 'Democracy Day'
          }
        },
        '06-12 prior to 2018': {
          name: {
            en: 'M.K.O Abiola Day'
          }
        },
        '06-12 and if Saturday then next Monday since 2018': {
          substitute: true,
          name: {
            en: 'Democracy Day'
          }
        },
        '10-01': {
          _name: 'Independence Day'
        },
        '11-01 since 2020': {
          name: {
            en: 'National Youth Day'
          }
        },
        '12-31': {
          _name: '12-31',
          type: 'observance'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        },
        '1 Muharram': {
          _name: '1 Muharram'
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal'
        },
        '1 Shawwal P2D': {
          _name: '1 Shawwal',
          name: {
            en: 'Id el Fitr'
          }
        },
        '10 Dhu al-Hijjah P2D': {
          _name: '10 Dhu al-Hijjah',
          name: {
            en: 'Id el Kabir'
          }
        }
      }
    },
    NI: {
      names: {
        es: 'Nicaragua',
        en: 'Nicaragua'
      },
      dayoff: 'sunday',
      langs: [
        'es'
      ],
      zones: [
        'America/Managua'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-18': {
          name: {
            en: 'Birthday of Rubén Darío',
            es: 'Natalicio de Rubén Darío'
          },
          type: 'observance'
        },
        'easter -3': {
          _name: 'easter -3'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        '05-01': {
          _name: '05-01'
        },
        '05-30': {
          _name: 'Mothers Day',
          name: {
            es: 'Día de la madre nicaragüense'
          },
          type: 'observance'
        },
        '06-01': {
          name: {
            en: "Children's Day",
            es: 'Día del niño'
          }
        },
        '06-23': {
          _name: 'Fathers Day',
          name: {
            es: 'Día del padre nicaragüense'
          },
          type: 'observance'
        },
        '07-19': {
          name: {
            en: 'Revolution Day',
            es: 'Triunfo de la Revolución Popular'
          }
        },
        '09-14': {
          name: {
            en: 'Battle of San Jacinto',
            es: 'Batalla de San Jacinto'
          }
        },
        '09-15': {
          _name: 'Independence Day'
        },
        '10-12': {
          name: {
            en: 'Indigenous Resistance Day',
            es: 'Día de la resistencia indígena'
          }
        },
        '12-08': {
          _name: '12-08'
        },
        '12-24': {
          _name: '12-24',
          type: 'observance'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-31': {
          _name: '12-31',
          type: 'observance'
        }
      }
    },
    NL: {
      names: {
        nl: 'Nederland',
        en: 'Netherlands'
      },
      dayoff: 'sunday',
      langs: [
        'nl'
      ],
      zones: [
        'Europe/Amsterdam'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '04-27 if sunday then previous saturday': {
          name: {
            nl: 'Koningsdag'
          }
        },
        '05-04': {
          name: {
            nl: 'Nationale Dodenherdenking'
          },
          type: 'observance'
        },
        '05-05': {
          name: {
            nl: 'Bevrijdingsdag'
          },
          type: 'observance'
        },
        '2nd sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        '3rd sunday in June': {
          _name: 'Fathers Day',
          type: 'observance'
        },
        'easter 39': {
          _name: 'easter 39'
        },
        'easter 49': {
          _name: 'easter 49'
        },
        'easter 50': {
          _name: 'easter 50'
        },
        '3rd tuesday in September': {
          name: {
            nl: 'Prinsjesdag'
          },
          note: 'Scholen in Den Haag geven meestal 1 dag vrij',
          type: 'observance'
        },
        '11-11': {
          _name: '11-11',
          type: 'observance'
        },
        '12-05': {
          name: {
            nl: 'Sinterklaasavond',
            en: "St Nicholas' Eve"
          },
          type: 'observance'
        },
        '12-15': {
          name: {
            nl: 'Koninkrijksdag',
            en: 'Kingdom Day'
          },
          type: 'observance'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        },
        '12-31': {
          _name: '12-31',
          type: 'bank'
        }
      }
    },
    NO: {
      names: {
        no: 'Norge',
        en: 'Norway'
      },
      dayoff: 'sunday',
      langs: [
        'no'
      ],
      zones: [
        'Europe/Oslo'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '2nd sunday in February': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        'easter -49': {
          name: {
            no: 'Fastelavn',
            en: 'Carnival'
          },
          type: 'observance'
        },
        'easter -7': {
          _name: 'easter -7',
          type: 'observance'
        },
        'easter -3': {
          _name: 'easter -3'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01'
        },
        '05-08': {
          _name: 'Liberation Day',
          type: 'observance'
        },
        '05-17': {
          _name: 'Constitution Day',
          name: {
            no: '17. mai'
          }
        },
        'easter 39': {
          _name: 'easter 39'
        },
        'easter 49': {
          _name: 'easter 49'
        },
        'easter 50': {
          _name: 'easter 50'
        },
        '06-23': {
          name: {
            no: 'Sankthansaften',
            en: 'Midsummar Eve'
          },
          type: 'observance'
        },
        '2nd sunday in November': {
          _name: 'Fathers Day',
          type: 'observance'
        },
        '4th sunday before 12-24': {
          name: {
            no: 'Første søndag i advent',
            en: 'First Sunday of Advent'
          },
          type: 'observance'
        },
        '3rd sunday before 12-24': {
          name: {
            no: 'Andre søndag i advent',
            en: 'Second Sunday of Advent'
          },
          type: 'observance'
        },
        '2nd sunday before 12-24': {
          name: {
            no: 'Tredje søndag i advent',
            en: 'Third Sunday of Advent'
          },
          type: 'observance'
        },
        '1st sunday before 12-24': {
          name: {
            no: 'Fjerde søndag i advent',
            en: 'Fourth Sunday of Advent'
          },
          type: 'observance'
        },
        '12-24': {
          _name: '12-24',
          type: 'bank'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        },
        '12-31 14:00 if sunday then 00:00': {
          _name: '12-31',
          type: 'bank'
        }
      }
    },
    NZ: {
      names: {
        en: 'New Zealand',
        mi: 'Aotearoa'
      },
      dayoff: 'sunday',
      langs: [
        'en',
        'mi'
      ],
      zones: [
        'Pacific/Auckland',
        'Pacific/Chatham'
      ],
      days: {
        '01-01 and if saturday then next monday if sunday then next tuesday': {
          substitute: true,
          _name: '01-01'
        },
        '01-02 and if saturday then next monday if sunday then next tuesday': {
          substitute: true,
          name: {
            en: "Day after New Year's Day"
          }
        },
        '02-06 and if saturday,sunday then next monday': {
          substitute: true,
          name: {
            en: 'Waitangi Day'
          }
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '04-25 and if saturday,sunday then next monday': {
          substitute: true,
          name: {
            en: 'ANZAC Day'
          }
        },
        '1st monday in June': {
          name: {
            en: "Queen's Birthday"
          }
        },
        '4th monday in October': {
          _name: '05-01'
        },
        '12-25 and if saturday then next monday if sunday then next tuesday': {
          substitute: true,
          _name: '12-25'
        },
        '12-26 and if saturday then next monday if sunday then next tuesday': {
          substitute: true,
          _name: '12-26'
        },
        '2022-06-24': {
          name: {
            en: 'Matariki'
          }
        },
        '2023-07-14': {
          name: {
            en: 'Matariki'
          }
        },
        '2024-06-28': {
          name: {
            en: 'Matariki'
          }
        },
        '2025-06-20': {
          name: {
            en: 'Matariki'
          }
        },
        '2026-07-10': {
          name: {
            en: 'Matariki'
          }
        },
        '2027-06-25': {
          name: {
            en: 'Matariki'
          }
        },
        '2028-07-14': {
          name: {
            en: 'Matariki'
          }
        },
        '2029-07-06': {
          name: {
            en: 'Matariki'
          }
        },
        '2030-06-21': {
          name: {
            en: 'Matariki'
          }
        },
        '2031-07-11': {
          name: {
            en: 'Matariki'
          }
        },
        '2032-07-02': {
          name: {
            en: 'Matariki'
          }
        },
        '2033-06-24': {
          name: {
            en: 'Matariki'
          }
        },
        '2034-07-07': {
          name: {
            en: 'Matariki'
          }
        },
        '2035-06-29': {
          name: {
            en: 'Matariki'
          }
        },
        '2036-07-18': {
          name: {
            en: 'Matariki'
          }
        },
        '2037-07-10': {
          name: {
            en: 'Matariki'
          }
        },
        '2038-06-25': {
          name: {
            en: 'Matariki'
          }
        },
        '2039-07-15': {
          name: {
            en: 'Matariki'
          }
        },
        '2040-07-06': {
          name: {
            en: 'Matariki'
          }
        },
        '2041-07-19': {
          name: {
            en: 'Matariki'
          }
        },
        '2042-07-11': {
          name: {
            en: 'Matariki'
          }
        },
        '2043-07-03': {
          name: {
            en: 'Matariki'
          }
        },
        '2044-06-24': {
          name: {
            en: 'Matariki'
          }
        },
        '2045-07-07': {
          name: {
            en: 'Matariki'
          }
        },
        '2046-06-29': {
          name: {
            en: 'Matariki'
          }
        },
        '2047-07-19': {
          name: {
            en: 'Matariki'
          }
        },
        '2048-07-03': {
          name: {
            en: 'Matariki'
          }
        },
        '2049-06-25': {
          name: {
            en: 'Matariki'
          }
        },
        '2050-07-15': {
          name: {
            en: 'Matariki'
          }
        },
        '2051-06-30': {
          name: {
            en: 'Matariki'
          }
        },
        '2052-06-21': {
          name: {
            en: 'Matariki'
          }
        }
      },
      states: {
        AUK: {
          names: {
            en: 'Auckland Province',
            mi: 'Tāmaki-makau-rau'
          },
          days: {
            '01-29 if tuesday,wednesday,thursday then previous monday if friday,saturday,sunday then next monday': {
              name: {
                en: 'Provincial anniversary day'
              }
            }
          }
        },
        BOP: {
          names: {
            en: 'Bay of Plenty',
            mi: 'Te Moana-a-Toi'
          },
          days: {
            '01-29 if tuesday,wednesday,thursday then previous monday if friday,saturday,sunday then next monday': {
              name: {
                en: 'Provincial anniversary day'
              }
            }
          }
        },
        CAN: {
          names: {
            en: 'Canterbury',
            mi: 'Waitaha'
          },
          days: {
            'friday after 2nd tuesday in November': {
              name: {
                en: 'Christchurch Show Day'
              },
              note: 'May differ in parts of North Canterbury'
            }
          },
          regions: {
            Timaru: {
              name: 'Timaru District',
              days: {
                'friday after 2nd tuesday in November': false,
                '4th monday in September': {
                  name: {
                    en: 'Dominion Day'
                  }
                }
              }
            }
          }
        },
        CIT: {
          names: {
            en: 'Chatham Islands',
            mi: 'Wharekauri'
          },
          days: {
            '11-30 if tuesday,wednesday,thursday then previous monday if friday,saturday,sunday then next monday': {
              name: {
                en: 'Provincial anniversary day'
              }
            }
          }
        },
        GIS: {
          names: {
            en: 'Gisborne',
            mi: 'Te Tai Rāwhiti'
          },
          days: {
            '01-29 if tuesday,wednesday,thursday then previous monday if friday,saturday,sunday then next monday': {
              name: {
                en: 'Provincial anniversary day'
              }
            }
          }
        },
        HKB: {
          names: {
            en: "Hawke's Bay",
            mi: 'Te Matau-a-Māui'
          },
          days: {
            'friday before 4th monday in October': {
              name: {
                en: 'Provincial anniversary day'
              }
            }
          }
        },
        MBH: {
          names: {
            en: 'Marlborough',
            mi: 'Te Tauihu-o-te-waka'
          },
          days: {
            '5th monday in October': {
              name: {
                en: 'Provincial anniversary day'
              }
            }
          }
        },
        MWT: {
          name: 'Manawatu-Wanganui',
          days: {
            '01-22 if tuesday,wednesday,thursday then previous monday if friday,saturday,sunday then next monday': {
              name: {
                en: 'Provincial anniversary day'
              }
            }
          }
        },
        NSN: {
          names: {
            en: 'Nelson',
            mi: 'Whakatū'
          },
          days: {
            '02-01 if tuesday,wednesday,thursday then previous monday if friday,saturday,sunday then next monday': {
              name: {
                en: 'Provincial anniversary day'
              }
            }
          }
        },
        NTL: {
          names: {
            en: 'Northland',
            mi: 'Te Tai Tokerau'
          },
          days: {
            '01-29 if tuesday,wednesday,thursday then previous monday if friday,saturday,sunday then next monday': {
              name: {
                en: 'Provincial anniversary day'
              }
            }
          }
        },
        OTA: {
          names: {
            en: 'Otago Province',
            mi: 'Ōtākou'
          },
          days: {
            '03-23 if Tuesday,Wednesday,Thursday then previous Monday if Friday,Saturday,Sunday then next Monday if is public holiday then next Monday': {
              name: {
                en: 'Provincial anniversary day'
              }
            }
          }
        },
        STL: {
          names: {
            en: 'Southland',
            mi: 'Murihiku'
          },
          days: {
            'easter 2': {
              name: {
                en: 'Provincial anniversary day'
              }
            }
          }
        },
        TAS: {
          names: {
            en: 'Tasman',
            mi: 'Te Tai-o-Aorere'
          },
          days: {
            '02-01 if tuesday,wednesday,thursday then previous monday if friday,saturday,sunday then next monday': {
              name: {
                en: 'Provincial anniversary day'
              }
            }
          }
        },
        TKI: {
          name: 'Taranaki',
          days: {
            '2nd monday in March': {
              name: {
                en: 'Provincial anniversary day'
              }
            }
          }
        },
        WKO: {
          name: 'Waikato',
          days: {
            '01-29 if tuesday,wednesday,thursday then previous monday if friday,saturday,sunday then next monday': {
              name: {
                en: 'Provincial anniversary day'
              }
            }
          }
        },
        WGN: {
          names: {
            en: 'Wellington Province',
            mi: 'Te Whanga-nui-a-Tara'
          },
          days: {
            '01-22 if tuesday,wednesday,thursday then previous monday if friday,saturday,sunday then next monday': {
              name: {
                en: 'Provincial anniversary day'
              }
            }
          }
        },
        WTC: {
          names: {
            en: 'Westland',
            mi: 'Te Tai Poutini'
          },
          days: {
            '12-01 if tuesday,wednesday,thursday then previous monday if friday,saturday,sunday then next monday': {
              name: {
                en: 'Provincial anniversary day'
              }
            }
          },
          regions: {
            Buller: {
              name: 'Buller district',
              days: {
                '12-01 if tuesday,wednesday,thursday then previous monday if friday,saturday,sunday then next monday': false,
                '02-01 if tuesday,wednesday,thursday then previous monday if friday,saturday,sunday then next monday': {
                  name: {
                    en: 'Provincial anniversary day'
                  }
                }
              }
            }
          }
        }
      }
    },
    PA: {
      names: {
        es: 'Panamá',
        en: 'Panama'
      },
      dayoff: 'sunday',
      langs: [
        'es'
      ],
      zones: [
        'America/Panama'
      ],
      days: {
        '01-01 and if sunday then next monday': {
          substitute: true,
          _name: '01-01'
        },
        '01-09 and if sunday then next monday': {
          substitute: true,
          name: {
            en: "Martyrs' Day",
            es: 'Día de los Mártires Caídos en la Gesta Patriótica'
          }
        },
        'easter -48': {
          _name: 'easter -48',
          type: 'observance'
        },
        'easter -47': {
          _name: 'easter -47'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        '05-01 and if sunday then next monday': {
          substitute: true,
          _name: '05-01'
        },
        '07-01 every 5 years since 2014': {
          name: {
            en: 'Presidential Inauguration'
          }
        },
        '11-03 and if sunday then next monday': {
          substitute: true,
          name: {
            en: 'Separation Day (from Columbia)',
            es: 'Día de la Separación (de Colombia)'
          }
        },
        '11-10 and if sunday then next monday': {
          substitute: true,
          name: {
            es: 'Primer Grito de Independencia'
          }
        },
        '11-28 and if sunday then next monday': {
          substitute: true,
          _name: 'Independence Day'
        },
        '12-08 and if sunday then next monday': {
          substitute: true,
          _name: 'Mothers Day'
        },
        '12-25 and if sunday then next monday': {
          substitute: true,
          _name: '12-25'
        }
      }
    },
    PE: {
      names: {
        es: 'Perú',
        en: 'Peru'
      },
      dayoff: 'sunday',
      langs: [
        'es',
        'qu'
      ],
      zones: [
        'America/Lima'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        'easter -3': {
          _name: 'easter -3'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter'
        },
        '05-01': {
          _name: '05-01'
        },
        '06-29': {
          _name: '06-29'
        },
        '07-28': {
          _name: 'Independence Day'
        },
        '07-29': {
          _name: 'Independence Day'
        },
        '08-30': {
          name: {
            en: 'Santa Rosa de Lima',
            es: 'Día de Santa Rosa de Lima'
          }
        },
        '10-08': {
          name: {
            en: 'Battle of Angamos',
            es: 'Combate de Angamos'
          }
        },
        '11-01': {
          _name: '11-01'
        },
        '12-08': {
          _name: '12-08'
        },
        '12-25': {
          _name: '12-25'
        }
      },
      regions: {
        CUS: {
          name: 'Cuzco',
          days: {
            '06-24': {
              name: {
                en: 'Festival of the Sun',
                es: 'Fiesta Inca del Sol',
                qu: 'Inti Raymi'
              },
              type: 'observance'
            }
          }
        }
      }
    },
    PH: {
      names: {
        en: 'Philippines'
      },
      langs: [
        'en',
        'fil'
      ],
      zones: [
        'Asia/Manila'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-23': {
          type: 'observance',
          name: {
            en: 'First Philippine Republic Day',
            fil: 'Araw ng Unang Republika ng Pilipinas'
          }
        },
        'chinese 01-0-01': {
          type: 'optional',
          name: {
            en: 'Chinese New Year',
            fil: 'Bagong Taon ng mga Tsino'
          }
        },
        '02-02': {
          type: 'observance',
          _name: 'Constitution Day'
        },
        'chinese 01-0-15': {
          type: 'observance',
          name: {
            en: 'Lantern Festival',
            fil: 'Piyesta ng mga Parol Tsino'
          }
        },
        '02-25': {
          name: {
            en: 'EDSA Revolution Anniversary',
            fil: 'Anibersaryo ng Rebolusyon sa EDSA'
          },
          type: 'optional',
          note: 'Non-working Day'
        },
        'easter -3': {
          _name: 'easter -3'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        'easter -1': {
          _name: 'easter -1',
          type: 'optional',
          note: 'Non-working Day'
        },
        easter: {
          _name: 'easter'
        },
        '04-09': {
          name: {
            en: 'Day of Valor',
            fil: 'Araw ng Kagitingan'
          }
        },
        '04-27': {
          type: 'observance',
          name: {
            en: 'Lapu-Lapu Day',
            fil: 'Araw ni Lapu-Lapu'
          }
        },
        '05-01': {
          _name: '05-01',
          name: {
            en: 'Labour Day',
            fil: 'Araw ng mga Manggagawa'
          }
        },
        '06-12': {
          _name: 'Independence Day'
        },
        '06-19': {
          type: 'observance',
          name: {
            en: "José Rizal's birthday",
            fil: 'Araw ng Kapanganakan ni José Rizal'
          },
          active: [
            {
              from: '1961-01-01T00:00:00.000Z'
            }
          ],
          disable: [
            '2011-06-19'
          ]
        },
        '2011-06-19': {
          name: {
            en: "José Rizal's birthday",
            fil: 'Araw ng Kapanganakan ni José Rizal'
          }
        },
        '07-27': {
          type: 'observance',
          name: {
            en: 'Iglesia ni Cristo Day',
            fil: 'Araw ng Iglesia ni Cristo'
          }
        },
        '08-21': {
          name: {
            en: 'Ninoy Aquino Day',
            fil: 'Araw ng Kabayanihan ni Ninoy Aquino'
          },
          type: 'optional',
          note: 'Non-working Day'
        },
        '1st monday before September': {
          name: {
            en: "National Heroes' Day",
            fil: 'Araw ng mga Bayani'
          }
        },
        'chinese 08-0-15': {
          type: 'observance',
          name: {
            en: 'Mid-Autumn Festival',
            fil: 'Piyestang Zhōngqiū Jié'
          }
        },
        '11-01': {
          _name: '11-01',
          type: 'optional',
          note: 'Non-working Day'
        },
        '11-02': {
          _name: '11-02',
          type: 'optional',
          note: 'Non-working Day'
        },
        '11-30': {
          name: {
            en: 'Bonifacio Day',
            fil: 'Araw ng Kapanganakan ni Bonifacio'
          }
        },
        '12-08': {
          _name: '12-08',
          name: {
            en: 'Feast of the Immaculate Conception of the Blessed Virgin Mary',
            fil: 'Pagdiriwang ng Kalinis-linisang Paglilihi sa Mahal na Birheng Maria'
          },
          type: 'optional',
          note: 'Non-working Day'
        },
        '12-24': {
          _name: '12-24',
          type: 'optional',
          note: 'Non-working Day'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-30': {
          name: {
            en: 'Rizal Day',
            fil: 'Paggunita sa Kamatayan ni Dr. Jose Rizal'
          }
        },
        '12-31': {
          _name: '12-31',
          type: 'optional',
          note: 'Non-working Day'
        },
        '1 Muharram': {
          type: 'observance',
          _name: '1 Muharram'
        },
        '12 Rabi al-awwal': {
          type: 'observance',
          _name: '12 Rabi al-awwal'
        },
        '1 Shawwal': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah'
        }
      }
    },
    PL: {
      names: {
        pl: 'Polska',
        en: 'Poland'
      },
      dayoff: 'sunday',
      langs: [
        'pl'
      ],
      zones: [
        'Europe/Warsaw'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-06': {
          _name: '01-06'
        },
        easter: {
          _name: 'easter'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01',
          name: {
            pl: 'Święto Państwowe; Święto Pracy'
          }
        },
        '05-03': {
          name: {
            pl: 'Święto Narodowe Trzeciego Maja',
            en: 'Constitution Day'
          }
        },
        '05-26': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        'easter 49': {
          _name: 'easter 49'
        },
        'easter 60': {
          _name: 'easter 60'
        },
        '08-15': {
          _name: '08-15'
        },
        '11-01': {
          _name: '11-01'
        },
        '11-11': {
          _name: 'Independence Day'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        }
      }
    },
    PM: {
      names: {
        en: 'St. Pierre & Miquelon'
      },
      langs: [
        'fr'
      ],
      zones: [
        'America/Miquelon'
      ],
      dayoff: 'sunday',
      days: {},
      _days: 'FR'
    },
    PR: {
      names: {
        en: 'Puerto Rico'
      },
      langs: [
        'es',
        'en'
      ],
      zones: [
        'America/Puerto_Rico'
      ],
      dayoff: 'sunday',
      _days: 'US',
      days: {
        '01-06': {
          _name: '01-06'
        },
        '2nd Monday in January': {
          name: {
            es: 'Natalicio de Eugenio María de Hostos',
            en: 'Birthday of Eugenio María de Hostos'
          }
        },
        '02-18': {
          name: {
            es: 'Natalicio de Luis Muñoz Marín',
            en: 'Birthday of Luis Muñoz Marín'
          }
        },
        '03-02 since 2017': {
          name: {
            es: 'Día de la Ciudadanía Americana',
            en: 'American Citizenship Day'
          }
        },
        '03-17': false,
        '03-22': {
          name: {
            es: 'Día de la Abolición de Esclavitud',
            en: 'Emancipation Day'
          }
        },
        '04-16': {
          name: {
            es: 'Natalicio de José de Diego',
            en: 'Birthday of José de Diego'
          }
        },
        '3rd Monday in July': {
          name: {
            es: 'Natalicio de Don Luis Muñoz Rivera',
            en: 'Birthday of Don Luis Muñoz Rivera'
          }
        },
        '07-25': {
          name: {
            es: 'Constitución de Puerto Rico',
            en: 'Puerto Rico Constitution Day'
          }
        },
        '07-27': {
          name: {
            es: 'Natalicio de Dr. José Celso Barbosa',
            en: 'Birthday of Dr. José Celso Barbosa'
          }
        },
        '11-19': {
          name: {
            es: 'Día del Descubrimiento de Puerto Rico',
            en: 'Discovery of Puerto Rico'
          }
        }
      }
    },
    PT: {
      names: {
        pt: 'Portugal',
        en: 'Portugal'
      },
      dayoff: 'sunday',
      langs: [
        'pt'
      ],
      zones: [
        'Europe/Lisbon',
        'Atlantic/Madeira',
        'Atlantic/Azores'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        'easter -47': {
          _name: 'easter -47',
          type: 'observance'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter'
        },
        '04-25': {
          name: {
            pt: 'Dia da Liberdade',
            en: 'Liberty Day'
          }
        },
        '05-01': {
          _name: '05-01'
        },
        '1st sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        'easter 60': {
          _name: 'easter 60'
        },
        '06-10': {
          name: {
            pt: 'Dia de Portugal',
            en: 'Portugal Day'
          }
        },
        '08-15': {
          _name: '08-15'
        },
        '10-05': {
          name: {
            pt: 'Implantação da República'
          }
        },
        '11-01': {
          _name: '11-01'
        },
        '12-01': {
          name: {
            pt: 'Restauração da Independência'
          }
        },
        '12-08': {
          _name: '12-08'
        },
        '12-24': {
          _name: '12-24',
          type: 'observance'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-31': {
          _name: '12-31',
          type: 'observance'
        }
      }
    },
    PY: {
      names: {
        es: 'Paraguay',
        en: 'Paraguay'
      },
      dayoff: 'sunday',
      langs: [
        'es'
      ],
      zones: [
        'America/Asuncion'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '03-01': {
          disable: [
            '2017-03-01'
          ],
          enable: [
            '2017-02-27'
          ],
          name: {
            en: "Heroes' Day",
            es: 'Dia de los héroes'
          }
        },
        'easter -3': {
          _name: 'easter -3'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        '04-30': {
          name: {
            en: "Teacher's Day",
            es: 'Día del Maestro'
          },
          type: 'optional',
          note: 'Affects educational institutions'
        },
        '05-01': {
          _name: '05-01'
        },
        '05-14': {
          _name: 'Independence Day'
        },
        '05-15': {
          _name: 'Independence Day'
        },
        '06-12': {
          name: {
            en: 'Chaco Armistice',
            es: 'Día de la Paz del Chaco'
          },
          disable: [
            '2020-06-12'
          ],
          enable: [
            '2020-06-15'
          ]
        },
        '08-15': {
          _name: '08-15',
          disable: [
            '2017-08-15'
          ],
          enable: [
            '2017-08-14'
          ]
        },
        '09-29': {
          disable: [
            '2017-09-29'
          ],
          enable: [
            '2017-10-02'
          ],
          name: {
            en: 'Boqueron Battle Victory Day',
            es: 'Victoria de Boquerón'
          }
        },
        '12-08': {
          _name: '12-08',
          name: {
            en: 'Virgin of Caacupe',
            es: 'Virgen de Caacupé'
          }
        },
        '12-25': {
          _name: '12-25'
        },
        '12-31': {
          _name: '12-31',
          type: 'bank'
        }
      }
    },
    RE: {
      names: {
        fr: 'Réunion',
        en: 'Réunion'
      },
      langs: [
        'fr'
      ],
      zones: [
        'Indian/Reunion'
      ],
      dayoff: '',
      _days: 'FR',
      days: {
        '12-20': {
          _name: 'Abolition of Slavery'
        }
      }
    },
    RO: {
      names: {
        ro: 'Romania',
        en: 'Romania'
      },
      dayoff: 'sunday',
      langs: [
        'ro'
      ],
      zones: [
        'Europe/Bucharest'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-24': {
          name: {
            ro: 'Ziua Unirii',
            en: 'Unification Day'
          }
        },
        '03-08': {
          name: {
            ro: 'Ziua Mamei'
          },
          type: 'observance'
        },
        'orthodox -2': {
          _name: 'easter -2'
        },
        orthodox: {
          _name: 'easter'
        },
        'orthodox 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01'
        },
        'orthodox 39': {
          _name: 'easter 39',
          type: 'observance'
        },
        'orthodox 49': {
          _name: 'easter 49'
        },
        'orthodox 50': {
          _name: 'easter 50'
        },
        '1st sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        '06-01': {
          name: {
            ro: 'Ziua Copilului',
            en: "Children's Day"
          }
        },
        '06-26': {
          name: {
            ro: 'Ziua drapelului national',
            en: 'Flag Day'
          },
          type: 'observance'
        },
        '07-29': {
          name: {
            ro: 'Ziua Imnului național',
            en: 'National Anthem Day'
          },
          type: 'observance'
        },
        '08-15': {
          _name: '08-15'
        },
        '11-30': {
          name: {
            ro: 'Sfântul Andrei',
            en: "St Andrew's Day"
          }
        },
        '12-01': {
          name: {
            ro: 'Ziua națională, Ziua Marii Uniri',
            en: 'National holiday'
          }
        },
        '12-08': {
          _name: 'Constitution Day',
          type: 'observance'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        }
      }
    },
    RS: {
      names: {
        sr: 'Република Србија',
        en: 'Serbia'
      },
      langs: [
        'sr'
      ],
      zones: [
        'Europe/Belgrade'
      ],
      dayoff: 'sunday',
      days: {
        '01-01 if sunday then next tuesday': {
          _name: '01-01'
        },
        '01-02 if sunday then next monday': {
          _name: '01-01'
        },
        'julian 12-25': {
          _name: 'julian 12-25'
        },
        '02-15 if sunday then next tuesday': {
          name: {
            sr: 'Дан државности Србије',
            en: 'Statehood Day'
          }
        },
        '02-16 if sunday then next monday': {
          name: {
            sr: 'Дан државности Србије',
            en: 'Statehood Day'
          }
        },
        'orthodox -2': {
          _name: 'orthodox -2'
        },
        orthodox: {
          _name: 'orthodox'
        },
        'orthodox 1': {
          _name: 'orthodox 1'
        },
        '05-01 if sunday then next tuesday': {
          _name: '05-01'
        },
        '05-02 if sunday then next monday': {
          _name: '05-01'
        },
        '11-11 if sunday then next monday': {
          name: {
            sr: 'Дан примирја',
            en: 'Armistice Day'
          }
        },
        'easter -2': {
          _name: 'easter -2',
          type: 'optional',
          note: 'Catholic believers'
        },
        easter: {
          _name: 'easter',
          type: 'optional',
          note: 'Catholic believers'
        },
        'easter 1': {
          _name: 'easter 1',
          type: 'optional',
          note: 'Catholic believers'
        },
        '12-25': {
          _name: '12-25',
          type: 'optional',
          note: 'Catholic believers'
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah',
          type: 'optional',
          note: 'Muslim believers'
        },
        '1 Shawwal': {
          _name: '1 Shawwal',
          type: 'optional',
          note: 'Muslim believers'
        },
        '10 Tishrei': {
          _name: '10 Tishrei',
          type: 'optional',
          note: 'Jewish believers'
        },
        'julian 01-14': {
          name: {
            sr: 'Свети Сава',
            en: 'Saint Sava Day'
          },
          type: 'observance'
        },
        '04-22': {
          name: {
            sr: 'Дан сећања на жртве холокауста',
            en: 'Holocaust Remembrance Day'
          },
          type: 'observance'
        },
        '05-09': {
          name: {
            sr: 'Дан победе',
            en: 'Victory Day'
          },
          type: 'observance'
        },
        'julian 06-15': {
          name: {
            sr: 'Видовдан',
            en: 'Saint Vitus Day'
          },
          type: 'observance'
        },
        '10-21': {
          name: {
            sr: 'Дан сећања на српске жртве у Другом светском рату',
            en: 'World War II Serbian Victims Remembrance Day'
          },
          type: 'observance'
        }
      }
    },
    RU: {
      names: {
        ru: 'Россия',
        en: 'Russia'
      },
      dayoff: 'sunday',
      langs: [
        'ru'
      ],
      zones: [
        'Europe/Moscow',
        'Europe/Kaliningrad',
        'Europe/Simferopol',
        'Europe/Volgograd',
        'Europe/Samara',
        'Asia/Yekaterinburg',
        'Asia/Omsk',
        'Asia/Novosibirsk',
        'Asia/Novokuznetsk',
        'Asia/Krasnoyarsk',
        'Asia/Irkutsk',
        'Asia/Chita',
        'Asia/Yakutsk',
        'Asia/Khandyga',
        'Asia/Vladivostok',
        'Asia/Sakhalin',
        'Asia/Ust-Nera',
        'Asia/Magadan',
        'Asia/Srednekolymsk',
        'Asia/Kamchatka',
        'Asia/Anadyr'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-02 P5D': {
          name: {
            ru: 'Новогодние каникулы',
            en: 'New Year Holiday'
          }
        },
        'julian 12-25': {
          _name: '12-25'
        },
        '01-08': {
          name: {
            ru: 'Новогодние каникулы',
            en: 'New Year Holiday'
          }
        },
        '02-23': {
          name: {
            ru: 'День защитника Отечества',
            en: 'Defender of the Fatherland Day'
          }
        },
        '03-08': {
          _name: '03-08'
        },
        '05-01': {
          name: {
            ru: 'День весны и труда',
            en: 'Spring and Labour Day'
          }
        },
        '05-09': {
          name: {
            ru: 'День Победы',
            en: 'Victory Day'
          }
        },
        '06-12': {
          name: {
            ru: 'День России',
            en: 'Russia Day'
          }
        },
        '11-04': {
          name: {
            ru: 'День народного единства',
            en: 'Unity Day'
          }
        }
      }
    },
    RW: {
      names: {
        en: 'Rwanda',
        fr: 'République du Rwanda',
        rw: "Repubulika y'u Rwanda"
      },
      dayoff: 'sunday',
      langs: [
        'en',
        'fr',
        'rw'
      ],
      zones: [
        'Africa/Maputo'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-02': {
          _name: 'Public Holiday'
        },
        '02-01': {
          name: {
            en: 'Heroes Day'
          }
        },
        'easter -2': {
          _name: 'easter -2'
        },
        '04-07': {
          name: {
            fr: 'Jour de Mémorial du Génocide',
            en: 'Genocide Memorial Day'
          }
        },
        '05-01': {
          _name: '05-01'
        },
        '07-01': {
          _name: 'Independence Day'
        },
        '07-04': {
          name: {
            fr: 'Jour de la Libération',
            en: 'Liberation Day'
          }
        },
        '08-15': {
          _name: '08-15'
        },
        '1st friday in August': {
          name: {
            rw: 'Umuganura',
            fr: 'Journée nationale de récolte',
            en: 'National Harvest Day'
          }
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '1 Shawwal': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah'
        }
      }
    },
    SC: {
      names: {
        en: 'Seychelles',
        fr: 'République des Seychelles',
        crs: 'Repiblik Sesel'
      },
      langs: [
        'en',
        'fr',
        'crs'
      ],
      zones: [
        'Indian/Mahe'
      ],
      dayoff: 'sunday',
      days: {
        '01-01 P2D': {
          _name: '01-01'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        'easter -1': {
          _name: 'easter -1'
        },
        easter: {
          _name: 'easter'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        'easter 60': {
          _name: 'easter 60'
        },
        '05-01': {
          _name: '05-01'
        },
        '06-18': {
          _name: 'National Holiday'
        },
        '06-29': {
          _name: 'Independence Day'
        },
        '08-15': {
          _name: '08-15'
        },
        '11-01': {
          _name: '11-01'
        },
        '12-08': {
          _name: '12-08'
        },
        '12-25': {
          _name: '12-25'
        }
      }
    },
    SD: {
      names: {
        ar: 'جمهورية السودان',
        en: 'Sudan'
      },
      langs: [],
      zones: [
        'Africa/Khartoum'
      ],
      dayoff: '',
      days: {
        '01-01': {
          _name: 'Independence Day'
        },
        '12-19': {
          _name: 'Revolution Day'
        },
        '12-25': {
          _name: '12-25'
        },
        '1 Muharram': {
          _name: '1 Muharram'
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal'
        },
        '1 Shawwal P4D': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah P3D': {
          _name: '10 Dhu al-Hijjah'
        },
        'julian 12-25': {
          _name: 'julian 12-25',
          name: {
            en: 'Coptic Christmas'
          }
        },
        orthodox: {
          _name: 'orthodox',
          name: {
            en: 'Coptic Easter'
          }
        }
      }
    },
    SE: {
      names: {
        sv: 'Sverige',
        en: 'Sweden'
      },
      dayoff: 'sunday',
      langs: [
        'sv'
      ],
      zones: [
        'Europe/Stockholm'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-05 12:00': {
          name: {
            sv: 'Trettondagsafton'
          },
          type: 'optional'
        },
        '01-06': {
          _name: '01-06'
        },
        '01-13': {
          name: {
            sv: 'Tjugondag Knut'
          },
          type: 'observance'
        },
        '1st sunday in March': {
          name: {
            sv: 'Vasaloppet'
          },
          type: 'observance'
        },
        '03-25': {
          name: {
            sv: 'Marie Bebådelsedag',
            lat: 'Annuntiatio Mariæ'
          },
          type: 'observance'
        },
        '04-30 12:00': {
          name: {
            sv: 'Valborgsmässoafton',
            en: 'Walpurgis Night'
          },
          type: 'optional'
        },
        'easter -3': {
          _name: 'easter -3',
          type: 'observance'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter -1': {
          _name: 'easter -1',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01'
        },
        'easter 39': {
          _name: 'easter 39'
        },
        'easter 48': {
          name: {
            sv: 'Pingstafton',
            en: 'Whitsun Eve'
          },
          type: 'observance'
        },
        'easter 49': {
          _name: 'easter 49',
          type: 'public'
        },
        'easter 50': {
          _name: 'easter 50',
          type: 'observance'
        },
        'sunday before 06-01': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        '06-06': {
          name: {
            sv: 'Sveriges nationaldag',
            en: 'National Day'
          }
        },
        'friday after 06-19': {
          name: {
            sv: 'Midsommarafton',
            en: 'Midsummer Eve',
            fi: 'Juhannusaatto'
          },
          type: 'bank'
        },
        'saturday after 06-20': {
          name: {
            sv: 'Midsommardagen',
            en: 'Midsummer Day',
            fi: 'Juhannuspäivä'
          }
        },
        'friday after 10-30 12:00': {
          name: {
            sv: 'Allhelgonaafton',
            en: 'Halloween'
          },
          type: 'optional'
        },
        'saturday after 10-31': {
          _name: '11-01'
        },
        '11-06': {
          name: {
            sv: 'Gustav-Adolf-dagen'
          },
          type: 'observance'
        },
        '11-11': {
          name: {
            sv: 'Mårtensgås'
          },
          type: 'observance'
        },
        '12-10': {
          name: {
            sv: 'Nobeldagen'
          },
          type: 'observance'
        },
        '12-13': {
          name: {
            sv: 'Luciadagen'
          },
          type: 'observance'
        },
        '12-24': {
          _name: '12-24',
          type: 'bank'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        },
        '12-31': {
          _name: '12-31',
          type: 'bank'
        }
      }
    },
    SG: {
      names: {
        en: 'Singapore'
      },
      langs: [
        'en'
      ],
      zones: [
        'Asia/Singapore'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        'substitutes 01-01 if sunday then next monday': {
          substitute: true,
          _name: '01-01'
        },
        'chinese 01-0-01': {
          name: {
            en: 'Chinese New Year'
          }
        },
        'chinese 01-0-02': {
          name: {
            en: 'Chinese New Year'
          }
        },
        'substitutes chinese 01-0-01 if sunday then next tuesday': {
          substitute: true,
          name: {
            en: 'Chinese New Year'
          }
        },
        'substitutes chinese 01-0-02 if sunday then next monday': {
          substitute: true,
          name: {
            en: 'Chinese New Year'
          }
        },
        'easter -2': {
          _name: 'easter -2'
        },
        '05-01': {
          _name: '05-01'
        },
        'substitutes 05-01 if sunday then next monday': {
          substitute: true,
          _name: '05-01'
        },
        '08-09': {
          name: {
            en: 'National Day'
          }
        },
        'substitutes 08-09 if sunday then next monday': {
          substitute: true,
          name: {
            en: 'National Day'
          }
        },
        '12-25': {
          _name: '12-25'
        },
        'substitutes 12-25 if sunday then next monday': {
          substitute: true,
          _name: '12-25'
        },
        '1 Shawwal': {
          _name: '1 Shawwal',
          name: {
            en: 'Hari Raya Puasa'
          },
          disable: [
            '2022-05-02'
          ],
          enable: [
            '2022-05-03'
          ]
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah',
          name: {
            en: 'Hari Raya Haji'
          },
          disable: [
            '2022-07-09'
          ],
          enable: [
            '2022-07-10'
          ]
        },
        '2001-05-07': {
          _name: 'Vesak'
        },
        '2002-05-27': {
          _name: 'Vesak'
        },
        '2003-05-15': {
          _name: 'Vesak'
        },
        '2004-06-02': {
          _name: 'Vesak'
        },
        '2005-05-23': {
          _name: 'Vesak'
        },
        '2006-05-12': {
          _name: 'Vesak'
        },
        '2007-05-31': {
          _name: 'Vesak'
        },
        '2008-05-19': {
          _name: 'Vesak'
        },
        '2009-05-09': {
          _name: 'Vesak'
        },
        '2010-05-28': {
          _name: 'Vesak'
        },
        '2011-05-17': {
          _name: 'Vesak'
        },
        '2012-05-05': {
          _name: 'Vesak'
        },
        '2013-05-24': {
          _name: 'Vesak'
        },
        '2014-05-13': {
          _name: 'Vesak'
        },
        '2015-06-01': {
          _name: 'Vesak'
        },
        '2016-05-21': {
          _name: 'Vesak'
        },
        '2017-05-10': {
          _name: 'Vesak'
        },
        '2018-05-29': {
          _name: 'Vesak'
        },
        '2019-05-19': {
          _name: 'Vesak'
        },
        '2019-05-20': {
          substitute: true,
          _name: 'Vesak'
        },
        '2020-05-07': {
          _name: 'Vesak'
        },
        '2021-05-26': {
          _name: 'Vesak'
        },
        '2022-05-15': {
          _name: 'Vesak'
        },
        '2022-05-16': {
          substitute: true,
          _name: 'Vesak'
        },
        '2023-05-05': {
          _name: 'Vesak'
        },
        '2024-05-23': {
          _name: 'Vesak'
        },
        '2000-10-26': {
          _name: 'Deepavali'
        },
        '2001-11-14': {
          _name: 'Deepavali'
        },
        '2002-11-03': {
          _name: 'Deepavali'
        },
        '2002-11-04': {
          substitute: true,
          _name: 'Deepavali'
        },
        '2003-10-23': {
          _name: 'Deepavali'
        },
        '2004-11-11': {
          _name: 'Deepavali'
        },
        '2005-11-01': {
          _name: 'Deepavali'
        },
        '2006-10-21': {
          _name: 'Deepavali'
        },
        '2007-11-08': {
          _name: 'Deepavali'
        },
        '2008-10-27': {
          _name: 'Deepavali'
        },
        '2009-10-17': {
          _name: 'Deepavali'
        },
        '2010-11-05': {
          _name: 'Deepavali'
        },
        '2011-10-26': {
          _name: 'Deepavali'
        },
        '2012-11-13': {
          _name: 'Deepavali'
        },
        '2013-11-03': {
          _name: 'Deepavali'
        },
        '2013-11-04': {
          substitute: true,
          _name: 'Deepavali'
        },
        '2014-10-22': {
          _name: 'Deepavali'
        },
        '2015-11-10': {
          _name: 'Deepavali'
        },
        '2016-10-29': {
          _name: 'Deepavali'
        },
        '2017-10-18': {
          _name: 'Deepavali'
        },
        '2018-11-06': {
          _name: 'Deepavali'
        },
        '2019-10-27': {
          _name: 'Deepavali'
        },
        '2019-10-28': {
          substitute: true,
          _name: 'Deepavali'
        },
        '2020-11-14': {
          _name: 'Deepavali'
        },
        '2021-11-04': {
          _name: 'Deepavali'
        },
        '2022-10-24': {
          _name: 'Deepavali'
        },
        '2023-11-13': {
          _name: 'Deepavali'
        },
        '2024-10-31': {
          _name: 'Deepavali'
        },
        '2025-10-20': {
          _name: 'Deepavali'
        },
        '2026-11-09': {
          _name: 'Deepavali'
        },
        '2027-10-28': {
          _name: 'Deepavali'
        },
        '2028-11-15': {
          _name: 'Deepavali'
        },
        '2029-11-05': {
          _name: 'Deepavali'
        },
        '2030-10-25': {
          _name: 'Deepavali'
        }
      }
    },
    SH: {
      names: {
        en: 'St. Helena'
      },
      langs: [
        'en'
      ],
      zones: [
        'Africa/Abidjan'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        'substitutes 01-01 if sunday then next monday': {
          substitute: true,
          _name: '01-01'
        },
        'substitutes 01-01 if saturday then next monday': {
          substitute: true,
          _name: '01-01'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '3rd monday in April': {
          name: {
            en: "Queen's Birthday"
          }
        },
        '05-21': {
          name: {
            en: 'Saint Helena Day'
          }
        },
        'easter 50': {
          _name: 'easter 50'
        },
        'monday before 09-01': {
          name: {
            en: 'August Bank Holiday'
          }
        },
        '12-25': {
          _name: '12-25'
        },
        'substitutes 12-25 if saturday then next tuesday': {
          substitute: true,
          _name: '12-25'
        },
        'substitutes 12-25 if sunday then next tuesday': {
          substitute: true,
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        },
        'substitutes 12-26 if saturday then next monday': {
          substitute: true,
          _name: '12-26'
        },
        'substitutes 12-26 if sunday then next monday': {
          substitute: true,
          _name: '12-26'
        }
      },
      states: {
        AC: {
          name: 'Ascension Island',
          days: {
            'easter 39': {
              _name: 'easter 39'
            }
          }
        },
        HL: {
          name: 'Saint Helena',
          days: {}
        },
        TA: {
          name: 'Tristan da Cunha',
          days: {
            'easter 39': {
              _name: 'easter 39'
            },
            '2012-04-23': {
              name: {
                en: 'Ratting Day'
              }
            },
            '2013-05-03': {
              name: {
                en: 'Ratting Day'
              }
            },
            '2014-05-02': {
              name: {
                en: 'Ratting Day'
              }
            },
            '2015-05-16': {
              name: {
                en: 'Ratting Day'
              }
            },
            '2016-04-30': {
              name: {
                en: 'Ratting Day'
              }
            },
            '2017-05-26': {
              name: {
                en: 'Ratting Day'
              }
            },
            '2018-06-02': {
              name: {
                en: 'Ratting Day'
              }
            },
            '08-14': {
              name: {
                en: 'Anniversary Day'
              }
            },
            'monday before 09-01': false
          }
        }
      }
    },
    SI: {
      names: {
        sl: 'Republika Slovenija',
        en: 'Slovenia'
      },
      langs: [
        'sl'
      ],
      zones: [
        'Europe/Belgrade'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-02': {
          _name: '01-01',
          active: [
            {
              to: 1955
            },
            {
              from: 2017
            }
          ]
        },
        '02-08': {
          name: {
            en: 'Prešeren Day, the Slovenian Cultural Holiday',
            sl: 'Prešernov dan, slovenski kulturni praznik'
          },
          active: [
            {
              from: 1991
            }
          ]
        },
        '03-08': {
          _name: '03-08',
          type: 'observance'
        },
        '04-23': {
          name: {
            sl: 'Jurjevanje',
            en: "St. George's Day"
          },
          type: 'observance'
        },
        'easter -49': {
          name: {
            sl: 'Pust',
            en: 'Carnival'
          },
          type: 'observance'
        },
        easter: {
          _name: 'easter'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '04-27': {
          name: {
            sl: 'Dan upora proti okupatorju',
            en: 'Day of Uprising Against Occupation'
          }
        },
        '05-01': {
          _name: '05-01',
          name: {
            en: 'Labour Day'
          },
          active: [
            {
              from: 1949
            }
          ]
        },
        '05-02': {
          _name: '05-01',
          name: {
            en: 'Labour Day'
          },
          active: [
            {
              from: 1949
            }
          ]
        },
        'easter 49': {
          _name: 'easter 49'
        },
        '06-08': {
          name: {
            sl: 'Dan Primoža Trubarja',
            en: 'Primož Trubar Day'
          },
          type: 'observance',
          active: [
            {
              from: 2010
            }
          ]
        },
        '06-25': {
          name: {
            sl: 'Dan državnosti',
            en: 'Statehood Day'
          },
          active: [
            {
              from: 1991
            }
          ]
        },
        '08-15': {
          _name: '08-15',
          active: [
            {
              from: 1992
            }
          ]
        },
        '08-17': {
          name: {
            sl: 'Združitev prekmurskih Slovencev z matičnim narodom',
            en: 'Unification of Prekmurje Slovenes with the Mother Nation'
          },
          type: 'observance',
          active: [
            {
              from: 2006
            }
          ]
        },
        '09-15': {
          name: {
            sl: 'Vrnitev Primorske k matični domovini',
            en: 'Return of Primorska to the Motherland'
          },
          type: 'observance',
          active: [
            {
              from: 2005
            }
          ]
        },
        '09-23': {
          name: {
            sl: 'Dan slovenskega športa',
            en: 'Slovenian Sports Day'
          },
          type: 'observance',
          active: [
            {
              from: 2020
            }
          ]
        },
        '10-25': {
          name: {
            sl: 'Dan suverenosti',
            en: 'Sovereignty Day'
          },
          type: 'observance',
          active: [
            {
              from: 2015
            }
          ]
        },
        '10-31': {
          name: {
            sl: 'Dan reformacije',
            en: 'Reformation Day'
          }
        },
        '11-01': {
          name: {
            sl: 'Dan spomina na mrtve',
            en: 'Day of Remembrance for the Dead'
          }
        },
        '11-11': {
          name: {
            sl: 'Martinovanje',
            en: "St. Martin's Day"
          },
          type: 'observance'
        },
        '11-23': {
          name: {
            sl: 'Dan Rudolfa Maistra',
            en: 'Rudolf Maister Day'
          },
          type: 'observance',
          active: [
            {
              from: 2015
            }
          ]
        },
        '12-06': {
          name: {
            sl: 'Miklavž',
            en: 'Saint Nicholas Day'
          },
          type: 'observance'
        },
        '12-25': {
          _name: '12-25',
          active: [
            {
              to: 1953
            },
            {
              from: 1991
            }
          ]
        },
        '12-26': {
          name: {
            sl: 'Dan samostojnosti in enotnosti',
            en: 'Independence and Unity Day'
          }
        }
      }
    },
    SJ: {
      names: {
        en: 'Svalbard & Jan Mayen'
      },
      langs: [
        'no'
      ],
      zones: [
        'Europe/Oslo'
      ],
      dayoff: 'sunday',
      _days: 'NO'
    },
    SK: {
      names: {
        sk: 'Slovenská republika',
        en: 'Slovakia'
      },
      langs: [
        'sk'
      ],
      zones: [
        'Europe/Prague'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          _name: '01-01',
          name: {
            sk: 'Deň vzniku Slovenskej republiky'
          }
        },
        '01-06': {
          _name: '01-06'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01'
        },
        '05-08': {
          name: {
            sk: 'Deň víťazstva nad fašizmom',
            en: 'Day of victory over fascism'
          }
        },
        '2nd sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        '07-05': {
          name: {
            sk: 'Sviatok svätého Cyrila a Metoda',
            en: 'Saints Cyril and Methodius Day'
          }
        },
        '08-29': {
          name: {
            sk: 'Výročie Slovenského národného povstania',
            en: 'Slovak National Uprising anniversary'
          }
        },
        '09-01': {
          _name: 'Constitution Day'
        },
        '09-15': {
          name: {
            sk: 'Sviatok Panny Márie Sedembolestnej',
            en: 'Day of Our Lady of the Seven Sorrows'
          }
        },
        '11-01': {
          _name: '11-01'
        },
        '11-17': {
          name: {
            sk: 'Deň boja za slobodu a demokraciu',
            en: 'Struggle for Freedom and Democracy Day'
          }
        },
        '12-24': {
          _name: '12-24'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        }
      }
    },
    SL: {
      names: {
        en: 'Sierra Leone'
      },
      langs: [
        'en'
      ],
      zones: [
        'Africa/Abidjan'
      ],
      dayoff: 'sunday',
      days: {
        '01-01 and if Sunday then next Monday': {
          substitute: true,
          _name: '01-01'
        },
        '02-18 and if Sunday then next Monday': {
          substitute: true,
          name: {
            en: 'Armed Forces Day'
          }
        },
        '03-08 and if Sunday then next Monday': {
          substitute: true,
          _name: '03-08'
        },
        '04-27 and if Sunday then next Monday': {
          substitute: true,
          _name: 'Independence Day'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '1 Shawwal and if Sunday then next Monday': {
          substitute: true,
          _name: '1 Shawwal',
          name: {
            en: 'Korité'
          }
        },
        '10 Dhu al-Hijjah and if Sunday then next Monday': {
          substitute: true,
          _name: '10 Dhu al-Hijjah',
          name: {
            en: 'Tabaski'
          }
        },
        '12 Rabi al-awwal and if Sunday then next Monday': {
          substitute: true,
          _name: '12 Rabi al-awwal',
          name: {
            en: 'Mawlid'
          }
        },
        '12-25 and if Sunday then next Tuesday': {
          substitute: true,
          _name: '12-25'
        },
        '12-26 and if Sunday then next Monday': {
          substitute: true,
          _name: '12-26'
        }
      }
    },
    SM: {
      names: {
        it: 'San Marino',
        en: 'San Marino'
      },
      langs: [
        'it'
      ],
      zones: [
        'Europe/Rome'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-06': {
          _name: '01-06',
          name: {
            it: 'Epifania'
          }
        },
        '02-05': {
          name: {
            it: 'Festa di Sant’Agata',
            en: 'Feast of Saint Agatha'
          }
        },
        easter: {
          _name: 'easter'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '03-25': {
          name: {
            it: "Anniversario dell'Arengo",
            en: 'Anniversary of the Arengo'
          }
        },
        '04-01': {
          name: {
            it: 'Cerimonia di investitura dei Capitani Reggenti',
            en: 'Inauguration Ceremony'
          }
        },
        '05-01': {
          _name: '05-01'
        },
        '2nd sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        'easter 60': {
          _name: 'easter 60'
        },
        '07-28': {
          name: {
            it: 'Anniversario della caduta del Fascismo e Festa della Libertà',
            en: 'Liberation from Fascism'
          }
        },
        '08-15': {
          _name: '08-15'
        },
        '09-03': {
          name: {
            it: 'Festa di San Marino e di Fondazione della Repubblica',
            en: 'The Feast of San Marino and the Republic'
          }
        },
        '10-01': {
          name: {
            it: 'Cerimonia di investitura dei Capitani Reggenti'
          }
        },
        '11-01': {
          _name: '11-01',
          name: {
            it: 'Tutti i Santi'
          }
        },
        '11-02': {
          name: {
            it: 'Commemorazione dei defunti',
            en: 'Commemoration of the deceased'
          }
        },
        '12-08': {
          _name: '12-08'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        },
        '12-31': {
          _name: '12-31',
          type: 'optional'
        }
      }
    },
    SN: {
      names: {
        fr: 'République du Sénégal',
        wo: 'Réewum Senegaal',
        en: 'Senegal'
      },
      langs: [
        'fr',
        'wo'
      ],
      zones: [
        'Africa/Abidjan'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        '04-04': {
          _name: 'National Holiday'
        },
        '05-01': {
          _name: '05-01'
        },
        '08-15': {
          _name: '08-15'
        },
        '11-01': {
          _name: '11-01'
        },
        '12-25': {
          _name: '12-25'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        'easter 39': {
          _name: 'easter 39'
        },
        'easter 50': {
          _name: 'easter 50'
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal'
        },
        '1 Shawwal and if sunday then next monday': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah and if sunday then next monday': {
          _name: '10 Dhu al-Hijjah'
        },
        '10 Muharram': {
          _name: '10 Muharram'
        },
        '18 Safar': {
          name: 'Magal de Touba'
        }
      }
    },
    SO: {
      names: {
        so: 'Jamhuuriyadda Federaalka Soomaaliya',
        ar: 'جمهورية الصومال الفدرالية',
        en: 'Somalia'
      },
      dayoff: '?',
      langs: [
        'so',
        'ar',
        'en'
      ],
      zones: [
        'Africa/Nairobi'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '05-01': {
          _name: '05-01'
        },
        '06-26': {
          name: {
            ar: 'استقلال الصومال البريطاني',
            en: 'Independence of British Somaliland'
          }
        },
        '07-01': {
          _name: 'Independence Day'
        },
        '10 Muharram': {
          _name: '10 Muharram'
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal'
        },
        '1 Shawwal': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah'
        }
      },
      states: {
        AW: {
          name: 'Awdal',
          days: {
            '01-01': false,
            '05-18 P2D': {
              name: {
                en: 'Restoration of Somaliland Sovereignty'
              }
            },
            '07-01': false,
            '1 Muharram': {
              _name: '1 Muharram'
            },
            '10 Muharram': false,
            '27 Rajab': {
              _name: '27 Rajab'
            }
          }
        },
        SA: {
          name: 'Sanaag',
          _days: [
            'SO',
            'states',
            'AW'
          ]
        },
        SO: {
          name: 'Sool',
          _days: [
            'SO',
            'states',
            'AW'
          ]
        },
        TO: {
          name: 'Togdheer',
          _days: [
            'SO',
            'states',
            'AW'
          ]
        },
        WO: {
          name: 'Woqooyi Galbeed',
          _days: [
            'SO',
            'states',
            'AW'
          ]
        }
      }
    },
    SR: {
      names: {
        en: 'Suriname'
      },
      langs: [
        'nl',
        'srn'
      ],
      zones: [
        'America/Paramaribo'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        'chinese 01-0-01': {
          name: {
            nl: 'Chinees Nieuwjaar',
            en: 'Chinese New Year'
          }
        },
        '02-25': {
          name: {
            nl: 'Dag van Bevrijding en Vernieuwing',
            en: 'Day of Liberation and Innovation'
          }
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01'
        },
        '07-01': {
          name: {
            nl: 'Dag der Vrijheden (Keti koti)',
            srn: 'Keti koti',
            en: 'Emancipation Day'
          }
        },
        '08-09': {
          name: {
            nl: 'Dag der Inheemsen',
            en: "Indigenous People's Day"
          }
        },
        '10-10': {
          name: {
            nl: 'Dag van de Marrons',
            en: 'Day of the Maroons'
          }
        },
        '11-25': {
          _name: 'Independence Day'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        },
        '1 Shawwal': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah'
        },
        '2015-03-06': {
          _name: 'Holi'
        },
        '2016-03-23': {
          _name: 'Holi'
        },
        '2017-03-12': {
          _name: 'Holi'
        },
        '2018-03-02': {
          _name: 'Holi'
        },
        '2019-03-21': {
          _name: 'Holi'
        },
        '2020-03-09': {
          _name: 'Holi'
        },
        '2021-03-28': {
          _name: 'Holi'
        },
        '2022-03-18': {
          _name: 'Holi'
        },
        '2023-03-07': {
          _name: 'Holi'
        },
        '2024-03-25': {
          _name: 'Holi'
        },
        '2025-03-14': {
          _name: 'Holi'
        },
        '2026-03-03': {
          _name: 'Holi'
        },
        '2027-03-22': {
          _name: 'Holi'
        },
        '2028-03-11': {
          _name: 'Holi'
        },
        '2029-03-28': {
          _name: 'Holi'
        },
        '2030-03-19': {
          _name: 'Holi'
        },
        '2014-10-23': {
          _name: 'Deepavali'
        },
        '2015-11-11': {
          _name: 'Deepavali'
        },
        '2016-10-30': {
          _name: 'Deepavali'
        },
        '2017-10-19': {
          _name: 'Deepavali'
        },
        '2018-11-07': {
          _name: 'Deepavali'
        },
        '2019-10-27': {
          _name: 'Deepavali'
        },
        '2020-11-14': {
          _name: 'Deepavali'
        },
        '2021-11-04': {
          _name: 'Deepavali'
        },
        '2022-10-24': {
          _name: 'Deepavali'
        },
        '2023-11-12': {
          _name: 'Deepavali'
        },
        '2024-10-31': {
          _name: 'Deepavali'
        },
        '2025-10-20': {
          _name: 'Deepavali'
        },
        '2026-11-08': {
          _name: 'Deepavali'
        },
        '2027-10-28': {
          _name: 'Deepavali'
        },
        '2028-10-17': {
          _name: 'Deepavali'
        },
        '2029-11-05': {
          _name: 'Deepavali'
        },
        '2030-10-25': {
          _name: 'Deepavali'
        }
      }
    },
    SS: {
      names: {
        en: 'South Sudan'
      },
      dayoff: 'sunday',
      langs: [
        'en'
      ],
      zones: [
        'Africa/Maputo'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-09': {
          name: {
            en: 'Peace Agreement Day'
          }
        },
        '03-08': {
          _name: '03-08'
        },
        '05-16': {
          name: {
            en: 'SPLA Day'
          }
        },
        '1st monday in July': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        '07-09': {
          _name: 'Independence Day'
        },
        '07-30': {
          name: {
            en: 'Martyrs Day'
          }
        },
        '12-25': {
          _name: '12-25'
        },
        '12-28': {
          name: {
            en: 'Republic Day'
          }
        },
        '12-31': {
          _name: '12-31'
        },
        '2 Shawwal': {
          _name: '1 Shawwal'
        },
        '12 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah'
        }
      }
    },
    ST: {
      names: {
        pt: 'São Tomé & Príncipe',
        en: 'São Tomé & Príncipe'
      },
      langs: [
        'pt',
        'en'
      ],
      zones: [
        'Africa/Abidjan'
      ],
      dayoff: 'sunday',
      days: {
        '01-01 and if Saturday then previous Friday if Sunday then next Monday': {
          substitute: true,
          _name: '01-01'
        },
        '02-03 and if Saturday then previous Friday if Sunday then next Monday': {
          substitute: true,
          name: {
            en: "Martyrs' Day",
            pt: 'Dia dos Mártires'
          }
        },
        '05-01 and if Saturday then previous Friday if Sunday then next Monday': {
          substitute: true,
          _name: '05-01'
        },
        '07-12 and if Saturday then previous Friday if Sunday then next Monday': {
          substitute: true,
          _name: 'Independence Day'
        },
        '09-06 and if Saturday then previous Friday if Sunday then next Monday': {
          substitute: true,
          name: {
            en: 'Armed Forces Day',
            pt: 'Dia das Forças Armadas'
          }
        },
        '09-30 and if Saturday then previous Friday if Sunday then next Monday': {
          substitute: true,
          name: {
            en: 'Agricultural Reform Day',
            pt: 'Dia da Reforma Agrária'
          }
        },
        '12-21 and if Saturday then previous Friday if Sunday then next Monday': {
          substitute: true,
          name: {
            en: 'São Tomé Day',
            pt: 'Dia de São Tomé'
          }
        },
        '12-25 and if Saturday then previous Friday if Sunday then next Monday': {
          substitute: true,
          _name: '12-25'
        }
      }
    },
    SV: {
      names: {
        es: 'El Salvador',
        en: 'El Salvador'
      },
      dayoff: 'sunday',
      langs: [
        'es'
      ],
      zones: [
        'America/El_Salvador'
      ],
      days: {
        '01-01': {
          _name: '01-01',
          type: 'observance'
        },
        '01-16': {
          name: {
            es: 'Firma de los Acuerdos de Paz'
          },
          type: 'observance'
        },
        '03-08': {
          name: {
            es: 'Día de la Mujer'
          },
          type: 'observance'
        },
        'easter -3': {
          _name: 'easter -3'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        'easter -1': {
          _name: 'easter -1'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        '05-01': {
          _name: '05-01'
        },
        '05-07': {
          name: {
            en: "Soldier's Day",
            es: 'Día del Soldado'
          },
          type: 'observance'
        },
        '05-10': {
          _name: 'Mothers Day',
          type: 'optional',
          note: 'Public Offices only'
        },
        '06-17': {
          _name: 'Fathers Day',
          type: 'observance'
        },
        '06-22': {
          name: {
            es: 'Día del Maestro'
          },
          type: 'optional',
          note: 'Dayoff for teachers only'
        },
        '08-06': {
          name: {
            es: 'Celebración del Divino Salvador del Mundo'
          }
        },
        '09-15': {
          _name: 'Independence Day'
        },
        '11-02': {
          _name: '11-02'
        },
        '12-25': {
          _name: '12-25'
        }
      },
      regions: {
        SS: {
          name: 'San Salvador',
          days: {
            '08-03': {
              name: {
                es: 'Fiestas Agostinas'
              }
            },
            '08-05': {
              name: {
                es: 'Fiestas Agostinas'
              }
            }
          }
        }
      }
    },
    SX: {
      names: {
        en: 'Sint Maarten'
      },
      langs: [
        'nl'
      ],
      zones: [
        'America/Curacao'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '04-27': {
          name: {
            nl: 'Koningsdag',
            en: "King's Day"
          }
        },
        '04-30 if Sunday then next Tuesday prior to 2017': {
          name: {
            nl: 'Carnaval',
            en: 'Carnival'
          }
        },
        '04-30 if Saturday then previous Friday if Sunday then next Tuesday since 2017': {
          name: {
            nl: 'Carnaval',
            en: 'Carnival'
          }
        },
        '05-01 if Sunday then next Monday': {
          _name: '05-01'
        },
        'easter 39': {
          _name: 'easter 39'
        },
        'easter 49': {
          _name: 'easter 49'
        },
        '07-01': {
          name: {
            nl: 'Emancipatiedag',
            en: 'Emancipation Day'
          }
        },
        '10-09': {
          _name: 'Constitution Day'
        },
        '11-11': {
          name: {
            en: 'Sint Maarten Day'
          }
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        }
      }
    },
    SZ: {
      names: {
        ss: 'Eswatini',
        en: 'Swaziland'
      },
      langs: [
        'ss',
        'en'
      ],
      zones: [
        'Africa/Johannesburg'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '04-19 and if Saturday, Sunday then next Monday': {
          substitute: true,
          name: {
            en: 'Birthday of King Mswati III'
          }
        },
        '04-25 and if Saturday, Sunday then next Monday': {
          substitute: true,
          name: {
            en: 'National Flag Day'
          }
        },
        '05-01 and if Saturday, Sunday then next Monday': {
          substitute: true,
          _name: '05-01'
        },
        'easter 39': {
          _name: 'easter 39'
        },
        '07-22 and if Saturday, Sunday then next Monday': {
          substitute: true,
          name: {
            en: 'Birthday of the late King Sobhuza'
          }
        },
        '1st Monday in September': {
          name: {
            ss: 'Umhlanga Reed Dance',
            en: 'Umhlanga Reed Dance'
          }
        },
        '09-06 and if Saturday, Sunday then next Monday': {
          substitute: true,
          _name: 'Independence Day',
          name: {
            ss: 'Somhlolo Day'
          }
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26 and if Sunday then next Monday': {
          _name: '12-26'
        },
        '12-28 P6D': {
          name: {
            ss: 'Incwala',
            en: 'Incwala Festival'
          }
        }
      }
    },
    TC: {
      names: {
        en: 'Turks & Caicos Islands'
      },
      langs: [
        'en'
      ],
      zones: [
        'America/Grand_Turk'
      ],
      dayoff: 'sunday',
      days: {
        '01-01 and if Saturday, Sunday then next Monday': {
          _name: '01-01'
        },
        '2nd Monday in March': {
          name: {
            en: 'Commonwealth Day'
          }
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '1st Monday before 06-01': {
          name: {
            en: "National Heroes' Day"
          }
        },
        '2nd Monday after 06-02': {
          name: {
            en: "Queen's Birthday"
          }
        },
        '1st Monday in August': {
          name: {
            en: 'Emancipation Day'
          }
        },
        '1st Friday before 10-01': {
          name: {
            en: 'National Youth Day'
          }
        },
        '2nd Monday in October': {
          name: {
            en: 'National Heritage Day'
          }
        },
        '4th Friday in November': {
          name: {
            en: 'National Day of Thanksgiving'
          }
        },
        '12-25 and if Saturday then next Monday if Sunday then next Tuesday': {
          substitute: true,
          _name: '12-25'
        },
        '12-26 and if Saturday then next Monday if Sunday then next Tuesday': {
          substitute: true,
          _name: '12-26'
        }
      }
    },
    TD: {
      names: {
        ar: 'جمهورية تشاد',
        fr: 'République du Tchad',
        en: 'Chad'
      },
      langs: [
        'ar',
        'fr'
      ],
      zones: [
        'Africa/Ndjamena'
      ],
      dayoff: 'sunday',
      days: {
        '01-01 and if sunday then next monday': {
          _name: '01-01'
        },
        '05-01 and if sunday then next monday': {
          _name: '05-01'
        },
        '08-11 and if sunday then next monday': {
          name: {
            fr: 'Fête Nationale (Indépendance)',
            en: 'Independence Day'
          }
        },
        '12-01 and if sunday then next monday': {
          name: {
            fr: 'Journée de la libération et de la démocratie',
            en: 'Freedom and Democracy Day'
          }
        },
        '11-01': {
          _name: '11-01'
        },
        '11-28': {
          name: {
            fr: 'Anniversaire de la Proclamation de la République',
            en: 'Proclamation of the Republic'
          }
        },
        '12-25': {
          _name: '12-25'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal'
        },
        '1 Shawwal': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah'
        }
      }
    },
    TG: {
      names: {
        fr: 'République togolaise',
        en: 'Togolese Republic'
      },
      dayoff: 'sunday',
      langs: [
        'fr'
      ],
      zones: [
        'Africa/Abidjan'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-13': {
          name: {
            fr: 'Jour de la libération',
            en: 'Liberation Day'
          }
        },
        '04-27': {
          _name: 'Independence Day'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01'
        },
        'easter 39': {
          _name: 'easter 39'
        },
        'easter 50': {
          _name: 'easter 50'
        },
        '06-21': {
          name: {
            fr: 'Journée des Martyrs',
            en: 'Day of the Martyrs'
          }
        },
        '08-15': {
          _name: '08-15'
        },
        '11-01': {
          _name: '11-01'
        },
        '12-25': {
          _name: '12-25'
        },
        '13 Rabi al-awwal': {
          _name: '12 Rabi al-awwal'
        },
        '2 Shawwal': {
          _name: '1 Shawwal'
        },
        '11 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah'
        }
      }
    },
    TN: {
      names: {
        ar: 'الجمهورية التونسية',
        fr: 'République tunisienne',
        en: 'Tunisia'
      },
      langs: [
        'ar',
        'fr'
      ],
      zones: [
        'Africa/Tunis'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-14': {
          name: {
            fr: 'Fête de la Révolution et de la Jeunesse',
            ar: 'عيد الثورة و الشباب'
          }
        },
        '03-20': {
          name: {
            fr: "Fête de l'indépendance",
            ar: 'عيد الإستقلال'
          }
        },
        '04-09': {
          name: {
            fr: 'Journée des Martyrs',
            ar: 'عيد الشهداء'
          }
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal'
        },
        '1 Muharram': {
          _name: '1 Muharram'
        },
        '1 Shawwal': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah'
        },
        '05-01': {
          _name: '05-01'
        },
        '07-25': {
          name: {
            fr: 'Fête de la République',
            ar: 'عيد الجمهورية'
          }
        },
        '08-13': {
          name: {
            fr: 'Fête de la Femme et de la Famille',
            ar: 'عيد المرأة'
          }
        },
        '10-15': {
          name: {
            fr: "Fête de l'Évacuation",
            ar: 'عيد الجلاء'
          }
        }
      }
    },
    TO: {
      names: {
        to: 'Puleʻanga Fakatuʻi ʻo Tonga',
        en: 'Tonga'
      },
      langs: [
        'to',
        'en'
      ],
      zones: [
        'Pacific/Tongatapu'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '04-25': {
          name: {
            en: 'ANZAC Day'
          }
        },
        '06-04 if thursday,friday,saturday,sunday then next monday and if tuesday then previous monday': {
          name: {
            en: 'Emancipation Day'
          }
        },
        '07-04': {
          name: {
            en: 'Official Birthday of His Majesty King Tupou VI'
          }
        },
        '09-17 if thursday,friday,saturday,sunday then next monday and if tuesday then previous monday': {
          name: {
            en: 'Birthday of His Royal Highness The Crown Prince Tupotoʻa-ʻUlukalala'
          }
        },
        '11-04 if thursday,friday,saturday,sunday then next monday and if tuesday then previous monday': {
          _name: 'Constitution Day',
          name: {
            en: 'Constitutional Day'
          }
        },
        '12-04 if thursday,friday,saturday,sunday then next monday and if tuesday then previous monday': {
          name: {
            en: 'Tupou I Day'
          }
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        }
      }
    },
    TR: {
      names: {
        tr: 'Türkiye',
        en: 'Turkey'
      },
      dayoff: 'saturday',
      langs: [
        'tr'
      ],
      zones: [
        'Europe/Istanbul'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '04-23': {
          name: {
            en: "National Sovereignty and Children's Day",
            tr: 'Ulusal Egemenlik ve Çocuk Bayramı'
          }
        },
        '05-01': {
          _name: '05-01',
          name: {
            en: 'Labour and Solidarity Day',
            tr: 'Emek ve Dayanışma Günü'
          }
        },
        '05-19': {
          name: {
            en: 'Commemoration of Atatürk, Youth and Sports Day',
            tr: "Atatürk'ü Anma Gençlik ve Spor Bayramı"
          }
        },
        '07-15': {
          name: {
            en: 'Democracy and National Unity Day',
            tr: 'Demokrasi ve Millî Birlik Günü'
          }
        },
        '08-30': {
          name: {
            en: 'Victory Day',
            tr: 'Zafer Bayramı'
          }
        },
        '10-29': {
          name: {
            en: 'Republic Day',
            tr: 'Cumhuriyet Bayramı'
          }
        },
        '1 Shawwal PT90H': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah PT114H': {
          _name: '10 Dhu al-Hijjah'
        }
      }
    },
    TT: {
      names: {
        en: 'Trinidad & Tobago'
      },
      langs: [
        'en'
      ],
      zones: [
        'America/Port_of_Spain'
      ],
      dayoff: 'sunday',
      days: {
        '01-01 and if Sunday then next Monday': {
          substitute: true,
          _name: '01-01'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter'
        },
        'easter 1': {
          _name: 'easter 1',
          type: 'observance'
        },
        '03-30 and if Sunday then next Monday': {
          substitute: true,
          name: {
            en: 'Spiritual Baptist Liberation Day'
          }
        },
        'easter 60': {
          _name: 'easter 60'
        },
        '05-30 and if Sunday then next Monday': {
          substitute: true,
          name: {
            en: 'Indian Arrival Day'
          }
        },
        '06-19 and if Sunday then next Monday': {
          substitute: true,
          _name: '05-01'
        },
        '08-01 and if Sunday then next Monday': {
          substitute: true,
          name: {
            en: 'Emancipation Day'
          }
        },
        '08-31 and if Sunday then next Monday': {
          substitute: true,
          _name: 'Independence Day'
        },
        '09-24 and if Sunday then next Monday': {
          substitute: true,
          name: {
            en: 'Republic Day'
          }
        },
        '12-25 and if Sunday then next Tuesday': {
          substitute: true,
          _name: '12-25'
        },
        '12-26 and if Sunday then next Monday': {
          substitute: true,
          _name: '12-26'
        },
        '1 Shawwal and if Sunday then next Monday': {
          substitute: true,
          _name: '1 Shawwal'
        },
        '2012-11-13': {
          _name: 'Deepavali'
        },
        '2013-11-03': {
          _name: 'Deepavali'
        },
        '2013-11-04': {
          substitute: true,
          _name: 'Deepavali'
        },
        '2014-10-23': {
          _name: 'Deepavali'
        },
        '2015-11-11': {
          _name: 'Deepavali'
        },
        '2016-10-29': {
          _name: 'Deepavali'
        },
        '2017-10-19': {
          _name: 'Deepavali'
        },
        '2018-11-07': {
          _name: 'Deepavali'
        },
        '2019-10-27': {
          _name: 'Deepavali'
        },
        '2019-10-28': {
          substitute: true,
          _name: 'Deepavali'
        },
        '2020-11-14': {
          _name: 'Deepavali'
        },
        '2021-11-04': {
          _name: 'Deepavali'
        },
        '2022-10-24': {
          _name: 'Deepavali'
        },
        '2023-11-12': {
          _name: 'Deepavali'
        },
        '2023-11-13': {
          substitute: true,
          _name: 'Deepavali'
        },
        '2024-10-31': {
          _name: 'Deepavali'
        },
        '2025-10-20': {
          _name: 'Deepavali'
        },
        '2026-11-08': {
          _name: 'Deepavali'
        },
        '2026-11-09': {
          substitute: true,
          _name: 'Deepavali'
        },
        '2027-10-28': {
          _name: 'Deepavali'
        },
        '2028-10-17': {
          _name: 'Deepavali'
        },
        '2029-11-05': {
          _name: 'Deepavali'
        },
        '2030-10-25': {
          _name: 'Deepavali'
        }
      }
    },
    TW: {
      names: {
        zh: '中華民國',
        en: 'Taiwan'
      },
      langs: [
        'zh'
      ],
      zones: [
        'Asia/Taipei'
      ],
      dayoff: '',
      days: {
        '01-01 and if Saturday then previous Friday if Sunday then next Monday': {
          substitute: true,
          _name: '01-01',
          name: {
            zh: '中華民國開國紀念日 / 元旦',
            en: 'Founding of the Republic of China'
          }
        },
        'chinese 01-0-00': {
          name: {
            en: "Chinese New Year's Eve",
            zh: '農曆除夕'
          }
        },
        'chinese 01-0-01': {
          name: {
            en: 'Chinese New Year',
            zh: '農曆年初一'
          }
        },
        'chinese 01-0-01 if Monday then next Friday if Tuesday then next Saturdayif Wednesday then next Sunday if Thursday then next Monday if Friday then next Tuesday if Saturday then next Wednesday if Sunday then next Thursday': {
          name: {
            en: 'Chinese New Year Holiday',
            zh: '农历新年假期'
          }
        },
        'chinese 01-0-02': {
          name: {
            en: 'The second day of the Chinese New Year',
            zh: '農曆年初二'
          }
        },
        'chinese 01-0-03': {
          name: {
            en: 'The third day of the Chinese New Year',
            zh: '農曆年初三'
          }
        },
        'chinese 01-0-04': {
          name: {
            en: 'The forth day of the Chinese New Year',
            zh: '農曆年初四'
          }
        },
        '02-28 and if Sunday then next Monday': {
          substitute: true,
          name: {
            en: 'Peace Memorial Day',
            zh: '228和平紀念日'
          }
        },
        '04-04 and if Sunday then next Monday': {
          substitute: true,
          name: {
            en: "Children's Day",
            zh: '兒童節'
          }
        },
        'chinese 5-01 solarterm and if Sunday then next Monday': {
          substitute: true,
          name: {
            en: 'Tomb Sweeping Day',
            zh: '淸明節'
          }
        },
        'chinese 05-0-05 and if Sunday then next Monday': {
          substitute: true,
          name: {
            en: 'Dragon Boat Festival',
            zh: '端午節'
          }
        },
        'chinese 08-0-15 and if Sunday then next Monday': {
          substitute: true,
          name: {
            en: 'Mid-Autumn Festival',
            zh: '中秋節'
          }
        },
        '10-10 and if Sunday then next Monday': {
          substitute: true,
          name: {
            en: 'National Day / Double Tenth Day',
            zh: '國慶日 / 雙十節'
          }
        },
        '02-04': {
          name: {
            en: "Farmer's Day",
            zh: '農民節'
          },
          type: 'observance'
        },
        '03-08': {
          _name: '03-08',
          type: 'observance'
        },
        '03-12': {
          name: {
            en: 'Arbor Day',
            zh: '國父逝世紀念日'
          },
          type: 'observance'
        },
        '03-29': {
          name: {
            en: 'Youth Day',
            zh: '靑年節'
          },
          type: 'observance'
        },
        '05-01 and if Saturday then previous Friday if Sunday then next Monday': {
          substitute: true,
          _name: '05-01',
          name: {
            zh: '勞動節'
          },
          type: 'observance',
          note: 'private sector'
        },
        '05-04': {
          name: {
            en: 'Literary Day',
            zh: '文藝節'
          },
          type: 'observance'
        },
        '2nd Sunday in May': {
          _name: 'Mothers Day',
          name: {
            zh: '母親節'
          },
          type: 'observance'
        },
        '06-03': {
          name: {
            en: 'Opium Suppression Movement Day',
            zh: '禁菸節'
          },
          type: 'observance'
        },
        '08-08': {
          _name: 'Fathers Day',
          name: {
            zh: '父親節'
          },
          type: 'observance'
        },
        '09-01': {
          name: {
            en: "Journalist' Day",
            zh: '記者節'
          },
          type: 'observance'
        },
        '09-03': {
          name: {
            en: 'Armed Forces Day',
            zh: '軍人節'
          },
          type: 'observance'
        },
        '09-28': {
          name: {
            en: "Teachers' Day",
            zh: '孔子誕辰紀念日'
          },
          type: 'observance'
        },
        '10-21': {
          name: {
            en: 'Overseas Chinese Day',
            zh: '華僑節'
          },
          type: 'observance'
        },
        '10-25': {
          name: {
            en: 'Taiwan Retrocession Day',
            zh: '臺灣光復節'
          },
          type: 'observance'
        },
        '11-12': {
          name: {
            en: "Sun Yat-sen's Birthday",
            zh: '國父誕辰紀念日'
          },
          note: "Also Doctors' Day and Cultural Renaissance Day",
          type: 'observance'
        },
        'december solstice': {
          name: {
            en: 'Dongzhi Festival',
            zh: '冬至'
          },
          type: 'observance'
        },
        '12-25': {
          name: {
            en: 'Constitution Day',
            zh: '行憲紀念日'
          },
          type: 'observance'
        },
        'chinese 01-0-15': {
          name: {
            en: 'Lantern Festival',
            zh: '元宵節'
          },
          type: 'observance'
        },
        'chinese 01-0-15 #1': {
          name: {
            en: 'Tourism Day',
            zh: '觀光節'
          },
          type: 'observance'
        },
        'chinese 02-0-02': {
          name: {
            en: "Earth God's Birthday",
            zh: '土地公誕辰'
          },
          type: 'observance'
        },
        'chinese 02-0-19': {
          name: {
            en: "Kuan Yin's Birthday",
            zh: '觀音誕辰'
          },
          type: 'observance'
        },
        'chinese 03-0-15': {
          name: {
            en: "God of Medicine's Birthday",
            zh: '保生大帝誕辰'
          },
          type: 'observance'
        },
        'chinese 03-0-23': {
          name: {
            en: "Matsu's Birthday",
            zh: '媽祖誕辰'
          },
          type: 'observance'
        },
        'chinese 04-0-08': {
          name: {
            en: "Buddha's Birthday",
            zh: '佛誕日'
          },
          type: 'observance'
        },
        'chinese 05-0-13': {
          name: {
            en: "Kuan Kung's Birthday",
            zh: '關公誕辰'
          },
          type: 'observance'
        },
        'chinese 05-0-13 #1': {
          name: {
            en: "Cheng Huang's Birthday",
            zh: '城隍爺誕辰'
          },
          type: 'observance'
        },
        'chinese 07-0-07': {
          name: {
            en: 'Qixi Festival',
            zh: '七夕'
          },
          type: 'observance'
        },
        'chinese 07-0-15': {
          name: {
            en: 'Ghost Festival',
            zh: '中元節'
          },
          type: 'observance'
        },
        'chinese 09-0-09': {
          name: {
            en: 'Double Ninth Festival',
            zh: '重陽節'
          },
          type: 'observance'
        },
        'chinese 10-0-15': {
          name: {
            en: 'Saisiat Festival',
            zh: '賽夏節'
          },
          type: 'observance'
        }
      }
    },
    TZ: {
      names: {
        en: 'Tanzania'
      },
      dayoff: 'sunday',
      langs: [
        'en'
      ],
      zones: [
        'Africa/Nairobi'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-02': {
          name: {
            en: 'Zanzibar Revolution Day'
          }
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '04-07': {
          name: {
            en: 'Karume Day'
          }
        },
        '04-26': {
          name: {
            en: 'Union Day'
          }
        },
        '05-01': {
          _name: '05-01'
        },
        '07-07': {
          name: {
            en: 'Saba Saba Day'
          }
        },
        '08-08': {
          name: {
            en: 'Nane Nane Day'
          }
        },
        '10-14': {
          name: {
            en: 'Nyerere Day'
          }
        },
        '12-09': {
          _name: 'Independence Day'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-25'
        },
        '1 Shawwal P2D': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah'
        },
        '12 Rabi al-awwal': {
          _name: '12 Rabi al-awwal',
          name: {
            en: 'Maulid Day'
          }
        }
      }
    },
    UA: {
      names: {
        uk: 'Україна',
        en: 'Ukraine'
      },
      langs: [
        'uk'
      ],
      zones: [
        'Europe/Kiev',
        'Europe/Uzhgorod',
        'Europe/Zaporozhye'
      ],
      dayoff: 'sunday',
      days: {
        '01-01 and if saturday, sunday then next tuesday': {
          _name: '01-01',
          name: {
            en: 'New Year'
          },
          substitute: true
        },
        '01-02 and if saturday, sunday then next monday': {
          _name: '01-01',
          name: {
            en: 'New Year'
          },
          substitute: true
        },
        'julian 12-25 and if saturday, sunday then next monday': {
          _name: 'julian 12-25',
          substitute: true
        },
        '03-08 and if saturday, sunday then next monday': {
          _name: '03-08'
        },
        'orthodox and if sunday then next monday': {
          _name: 'orthodox'
        },
        'orthodox 49 and if sunday then next monday': {
          _name: 'easter 49'
        },
        '05-01 and if saturday, sunday then next tuesday': {
          _name: '05-01',
          substitute: true
        },
        '05-02 and if saturday, sunday then next monday': {
          _name: '05-01',
          substitute: true
        },
        '05-09 and if saturday, sunday then next monday': {
          name: {
            uk: 'День перемоги над нацизмом у Другій світовій війні',
            en: 'Victory Day'
          },
          substitute: true
        },
        '06-28 and if saturday, sunday then next monday': {
          _name: 'Constitution Day',
          substitute: true
        },
        '08-24 and if saturday, sunday then next monday': {
          _name: 'Independence Day',
          substitute: true
        },
        '10-14 and if saturday, sunday then next monday': {
          name: {
            uk: 'День захисника України',
            en: 'Defender of Ukraine Day'
          },
          substitute: true,
          active: [
            {
              from: '2015-03-05'
            }
          ]
        }
      }
    },
    UG: {
      names: {
        en: 'Uganda'
      },
      dayoff: 'sundays',
      langs: [
        'en',
        'sw'
      ],
      zones: [
        'Africa/Nairobi'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-26': {
          name: {
            en: 'Liberation Day'
          }
        },
        '02-16': {
          name: {
            en: 'Archbishop Janan Luwum Day'
          }
        },
        '03-08': {
          _name: '03-08'
        },
        'easter -46': {
          _name: 'easter -46',
          type: 'observance'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01'
        },
        '06-03': {
          name: {
            en: "Martyr's Day"
          }
        },
        '06-09': {
          name: {
            en: 'National Heroes Day'
          }
        },
        '10-09': {
          _name: 'Independence Day'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        },
        '1 Shawwal': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah'
        }
      }
    },
    US: {
      names: {
        en: 'United States of America'
      },
      dayoff: 'sunday',
      zones: [
        'America/New_York',
        'America/Detroit',
        'America/Kentucky/Louisville',
        'America/Kentucky/Monticello',
        'America/Indiana/Indianapolis',
        'America/Indiana/Vincennes',
        'America/Indiana/Winamac',
        'America/Indiana/Marengo',
        'America/Indiana/Petersburg',
        'America/Indiana/Vevay',
        'America/Chicago',
        'America/Indiana/Tell_City',
        'America/Indiana/Knox',
        'America/Menominee',
        'America/North_Dakota/Center',
        'America/North_Dakota/New_Salem',
        'America/North_Dakota/Beulah',
        'America/Denver',
        'America/Boise',
        'America/Phoenix',
        'America/Los_Angeles',
        'America/Metlakatla',
        'America/Anchorage',
        'America/Juneau',
        'America/Sitka',
        'America/Yakutat',
        'America/Nome',
        'America/Adak',
        'Pacific/Honolulu'
      ],
      langs: [
        'en-us',
        'en'
      ],
      days: {
        '01-01 and if sunday then next monday if saturday then previous friday': {
          substitute: true,
          _name: '01-01'
        },
        '3rd monday in January': {
          name: {
            en: 'Martin Luther King Jr. Day',
            es: 'Natalicio de Martin Luther King, Jr.'
          }
        },
        '3rd monday in February': {
          name: {
            en: "Washington's Birthday",
            es: 'Día de los Presidentes'
          }
        },
        '02-14': {
          _name: '02-14',
          type: 'observance'
        },
        '03-17': {
          name: {
            en: "St. Patrick's Day"
          },
          type: 'observance'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        '04-15 if friday then next monday if saturday,sunday then next tuesday': {
          name: {
            en: 'Tax Day'
          },
          type: 'observance'
        },
        'wednesday before 04-28': {
          name: {
            en: 'Administrative Professionals Day'
          },
          type: 'observance'
        },
        '2nd sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        'monday before 06-01': {
          name: {
            en: 'Memorial Day',
            es: 'Recordación de los Muertos de la Guerra'
          }
        },
        '06-19 and if sunday then next monday if saturday then previous friday since 2021': {
          substitute: true,
          name: {
            en: 'Juneteenth'
          }
        },
        '3rd sunday in June': {
          _name: 'Fathers Day',
          type: 'observance'
        },
        '07-04 and if sunday then next monday if saturday then previous friday': {
          substitute: true,
          _name: 'Independence Day'
        },
        '1st monday in September': {
          _name: '05-01'
        },
        '2nd monday in October': {
          name: {
            en: 'Columbus Day',
            es: 'Descubrimiento de América'
          }
        },
        '10-31 18:00': {
          name: {
            en: 'Halloween'
          },
          type: 'observance'
        },
        '11-11': {
          name: {
            en: 'Veterans Day',
            es: 'Día del Veterano'
          }
        },
        'substitutes 11-11 if sunday then next monday if saturday then previous friday': {
          substitute: true,
          name: {
            en: 'Veterans Day',
            es: 'Día del Veterano'
          },
          type: 'bank',
          note: 'Federal Government offices are closed'
        },
        'tuesday after 1st monday in November every 4 years since 1848': {
          name: {
            en: 'Election Day'
          },
          type: 'observance'
        },
        '4th thursday in November': {
          name: {
            en: 'Thanksgiving Day',
            es: 'Acción de Gracias'
          }
        },
        'friday after 4th thursday in November': {
          name: {
            en: 'Day after Thanksgiving Day',
            es: 'Dia despues Acción de Gracias'
          },
          type: 'observance'
        },
        '12-24': {
          _name: '12-24',
          type: 'optional'
        },
        '12-25 and if sunday then next monday if saturday then previous friday': {
          substitute: true,
          _name: '12-25'
        },
        '12-31': {
          _name: '12-31',
          type: 'observance'
        }
      },
      states: {
        AL: {
          name: 'Alabama',
          zones: [
            'America/Chicago'
          ],
          days: {
            '3rd monday in January': {
              name: {
                en: 'Robert E. Lee/Martin Luther King Birthday'
              }
            },
            '3rd monday in February': {
              name: {
                en: 'George Washington/Thomas Jefferson Birthday'
              }
            },
            '4th monday in April': {
              name: {
                en: 'Confederate Memorial Day'
              }
            },
            '1st monday in June': {
              name: {
                en: "Jefferson Davis' birthday"
              }
            }
          }
        },
        AK: {
          name: 'Alaska',
          zones: [
            'America/Anchorage',
            'America/Metlakatla',
            'America/Juneau',
            'America/Sitka',
            'America/Yakutat',
            'America/Nome'
          ],
          days: {
            '3rd monday in February': {
              name: {
                en: "President's Day"
              }
            },
            'monday before April': {
              name: {
                en: "Seward's Day"
              }
            },
            '2nd monday in October': {
              name: {
                en: 'Columbus Day'
              },
              active: [
                {
                  to: '2017-01-01'
                }
              ]
            },
            '2nd monday in October #1': {
              name: {
                en: "Indigenous Peoples' Day"
              },
              active: [
                {
                  from: '2017-01-01'
                }
              ]
            },
            '10-18': {
              name: {
                en: 'Alaska Day'
              }
            }
          }
        },
        AZ: {
          name: 'Arizona',
          zones: [
            'America/Phoenix',
            'America/Denver'
          ],
          days: {
            '3rd monday in January': {
              name: {
                en: 'Dr. Martin Luther King Jr./ Civil Rights Day'
              }
            },
            '3rd monday in February': {
              name: {
                en: "Lincoln/Washington Presidents' Day"
              }
            }
          }
        },
        AR: {
          name: 'Arkansas',
          zones: [
            'America/Chicago'
          ],
          days: {
            '3rd monday in January': {
              name: {
                en: "Dr. Martin Luther King Jr./Robert E. Lee's Birthdays"
              }
            },
            '3rd monday in February': {
              name: {
                en: "George Washington's Birthday/Daisy Gatson Bates Day"
              }
            },
            '12-24': {
              _name: '12-24'
            }
          }
        },
        CA: {
          name: 'California',
          zones: [
            'America/Los_Angeles'
          ],
          days: {
            '3rd monday in February': {
              name: {
                en: "Presidents' Day"
              }
            },
            '2nd monday in October': false,
            '02-15': {
              type: 'observance',
              name: {
                en: 'Susan B. Anthony Day'
              }
            },
            '03-31 and if sunday then next monday': {
              substitute: true,
              name: {
                en: 'César Chávez Day'
              }
            },
            '05-19': {
              type: 'observance',
              name: {
                en: 'Malcolm X Day'
              }
            },
            '05-23': {
              type: 'observance',
              name: {
                en: 'Harvey Milk Day'
              }
            },
            'friday after 4th thursday in November': {
              name: {
                en: 'Day after Thanksgiving Day'
              },
              type: 'public'
            }
          },
          regions: {
            LA: {
              name: 'Los Angeles',
              days: {
                '08-24': {
                  name: {
                    en: 'Kobe Bryant Day'
                  },
                  type: 'observance',
                  active: [
                    {
                      from: 2016
                    }
                  ]
                }
              }
            }
          }
        },
        CO: {
          name: 'Colorado',
          zones: [
            'America/Denver'
          ],
          days: {
            '3rd monday in February': {
              name: {
                en: 'Washington-Lincoln Day'
              }
            },
            '2nd monday in October': {
              type: 'observance'
            }
          }
        },
        CT: {
          name: 'Connecticut',
          zones: [
            'America/New_York'
          ],
          days: {
            '02-12': {
              name: {
                en: "Lincoln's Birthday"
              }
            },
            'easter -2': {
              _name: 'easter -2'
            }
          }
        },
        DE: {
          name: 'Delaware',
          days: {
            '2nd monday in October': false,
            '3rd monday in February': false,
            'easter -2': {
              _name: 'easter -2'
            },
            'friday after 4th thursday in November': {
              name: {
                en: 'Day After Thanksgiving'
              }
            },
            'tuesday after 1st monday in November in even years': {
              name: {
                en: 'Election Day'
              }
            }
          }
        },
        DC: {
          name: 'District of Columbia',
          days: {
            '04-16': {
              name: {
                en: 'Emancipation Day'
              }
            }
          }
        },
        FL: {
          name: 'Florida',
          days: {
            '2nd monday in October': false,
            '3rd monday in February': false,
            '02-15': {
              name: {
                en: 'Susan B. Anthony Day'
              }
            },
            'friday after 4th thursday in November': {
              name: {
                en: 'Day After Thanksgiving'
              }
            }
          }
        },
        GA: {
          name: 'Georgia',
          days: {
            '3rd monday in February': false,
            'monday before 05-01 #1': {
              name: {
                en: 'Confederate Memorial Day'
              },
              active: [
                {
                  to: '2016-01-01'
                }
              ]
            },
            'monday before 05-01 #2': {
              name: {
                en: 'State Holiday'
              },
              note: 'Known as Confederate Memorial Day prior to 2016',
              active: [
                {
                  from: '2016-01-01'
                }
              ]
            },
            'friday after 4th thursday in November #1': {
              name: {
                en: "Robert E. Lee's Birthday"
              },
              note: 'General Lee was born on 1807-01-19 but this holiday was traditionally observed the day after Thanksgiving.',
              active: [
                {
                  to: '2016-01-01'
                }
              ]
            },
            'friday after 4th thursday in November #2': {
              name: {
                en: 'State Holiday'
              },
              note: "Known as Robert E. Lee's Birtday prior to 2016",
              active: [
                {
                  from: '2016-01-01'
                }
              ]
            },
            '12-24': {
              name: {
                en: "Washington's Birthday"
              }
            },
            'substitutes 12-24 if wednesday then next friday': {
              substitute: true,
              name: {
                en: "Washington's Birthday"
              }
            }
          }
        },
        HI: {
          name: 'Hawaii',
          zones: [
            'Pacific/Honolulu'
          ],
          days: {
            '3rd monday in February': {
              name: {
                en: "Presidents' Day"
              }
            },
            '03-26 and if saturday then previous friday if sunday then next monday': {
              substitute: true,
              name: {
                en: 'Prince Jonah Kuhio Kalanianaole Day'
              }
            },
            'easter -2': {
              _name: 'easter -2'
            },
            '06-11 and if saturday then previous friday if sunday then next monday': {
              substitute: true,
              name: {
                en: 'Kamehameha Day'
              }
            },
            '3rd friday in August': {
              name: {
                en: 'Statehood Day'
              }
            },
            '2nd monday in October': false,
            'tuesday after 1st monday in November in even years': {
              name: {
                en: 'General Election Day'
              }
            }
          }
        },
        ID: {
          name: 'Idaho',
          zones: [
            'America/Boise',
            'America/Los_Angeles'
          ],
          days: {
            '3rd monday in January': {
              name: {
                en: 'Martin Luther King, Jr./ Idaho Human Rights Day'
              }
            },
            '3rd monday in February': {
              name: {
                en: "President's Day"
              }
            }
          }
        },
        IL: {
          name: 'Illinois',
          zones: [
            'America/Chicago'
          ],
          days: {
            '02-12': {
              name: {
                en: "Lincoln's Birthday"
              }
            },
            '1st monday in March': {
              name: {
                en: 'Casimir Pulaski Day'
              }
            },
            '05-19': {
              name: {
                en: 'Malcolm X Day'
              }
            },
            'tuesday after 1st monday in November in even years': {
              name: {
                en: 'Election Day'
              }
            }
          }
        },
        IN: {
          name: 'Indiana',
          zones: [
            'America/Indiana/Indianapolis',
            'America/Indiana/Vincennes',
            'America/Indiana/Winamac',
            'America/Indiana/Marengo',
            'America/Indiana/Petersburg',
            'America/Indiana/Vevay',
            'America/Indiana/Tell_City',
            'America/Indiana/Knox'
          ],
          days: {
            'easter -2': {
              _name: 'easter -2'
            },
            'tuesday after 1st monday in May': {
              name: {
                en: 'Primary Election Day'
              }
            },
            'tuesday after 1st monday in November': {
              name: {
                en: 'Election Day'
              }
            },
            'friday after 4th thursday in November': {
              name: {
                en: "Lincoln's Birthday"
              }
            }
          }
        },
        IA: {
          name: 'Iowa',
          zones: [
            'America/Chicago'
          ],
          days: {
            '02-12': {
              name: {
                en: "Lincoln's Birthday"
              }
            }
          }
        },
        KS: {
          name: 'Kansas',
          zones: [
            'America/Chicago',
            'America/Denver'
          ],
          days: {
            '3rd monday in February': false
          }
        },
        KY: {
          name: 'Kentucky',
          zones: [
            'America/Kentucky/Louisville',
            'America/Kentucky/Monticello'
          ],
          days: {
            '3rd monday in February': false,
            'easter -2 14:00': {
              _name: 'easter -2'
            },
            '12-24': {
              _name: '12-24'
            },
            '12-31': {
              _name: '12-31'
            }
          }
        },
        LA: {
          name: 'Louisiana',
          zones: [
            'America/Chicago'
          ],
          days: {
            'easter -2': {
              _name: 'easter -2'
            },
            'tuesday after 1st monday in November in even years': {
              name: {
                en: 'Election Day'
              }
            }
          },
          regions: {
            NO: {
              name: 'New Orleans',
              days: {
                'easter -47': {
                  _name: 'easter -47',
                  name: {
                    en: 'Mardi Gras'
                  }
                }
              }
            }
          }
        },
        ME: {
          name: 'Maine',
          zones: [
            'America/New_York'
          ],
          days: {
            '3rd monday in February': {
              name: {
                en: "Washington's Birthday/President's Day"
              }
            },
            '3rd monday in April': {
              name: {
                en: "Patriots' Day"
              }
            }
          }
        },
        MD: {
          name: 'Maryland',
          zones: [
            'America/New_York'
          ],
          days: {
            '3rd monday in February': {
              name: {
                en: "President's Day"
              }
            },
            'friday before 1st monday before 06-01': {
              name: {
                en: 'Service Reduction Day'
              }
            },
            'friday after 4th thursday in November': {
              name: {
                en: 'Native American Heritage Day'
              }
            }
          }
        },
        MA: {
          name: 'Massachusetts',
          zones: [
            'America/New_York'
          ],
          days: {
            '03-17': {
              name: {
                en: 'Evacuation Day'
              }
            },
            '3rd monday in April': {
              name: {
                en: "Patriots' Day"
              }
            },
            '06-17': {
              name: {
                en: 'Bunker Hill Day'
              }
            }
          }
        },
        MI: {
          name: 'Michigan',
          zones: [
            'America/Detroit',
            'America/Menominee'
          ],
          days: {
            '12-24': {
              _name: '12-24'
            },
            '12-31': {
              _name: '12-31'
            }
          }
        },
        MN: {
          name: 'Minnesota',
          zones: [
            'America/Chicago'
          ],
          days: {
            '3rd monday in February': {
              name: {
                en: "Washington's and Lincoln's Birthday"
              }
            },
            '2nd monday in October': {
              name: {
                en: 'Columbus Day'
              },
              active: [
                {
                  to: '2017-01-01'
                }
              ]
            },
            '2nd monday in October #1': {
              name: {
                en: 'Indigenous Peoples’ Day'
              },
              active: [
                {
                  from: '2017-01-01'
                }
              ]
            }
          }
        },
        MS: {
          name: 'Mississippi',
          zones: [
            'America/Chicago'
          ],
          days: {
            '3rd monday in January': {
              name: {
                en: "Martin Luther King's and Robert E. Lee's Birthdays"
              }
            },
            'monday before 05-01': {
              name: {
                en: 'Confederate Memorial Day'
              }
            }
          }
        },
        MO: {
          name: 'Missouri',
          zones: [
            'America/Chicago'
          ],
          days: {
            '02-12': {
              name: {
                en: "Lincoln's Birthday"
              }
            },
            '05-08': {
              name: {
                en: 'Truman Day'
              }
            }
          }
        },
        MT: {
          name: 'Montana',
          zones: [
            'America/Denver'
          ],
          days: {
            '3rd monday in February': {
              name: {
                en: "Lincoln's and Washington's Birthday"
              }
            },
            'tuesday after 1st monday in November': {
              name: {
                en: 'Election Day'
              }
            },
            '12-24': {
              _name: '12-24'
            },
            '12-31': {
              _name: '12-31'
            }
          }
        },
        NE: {
          name: 'Nebraska',
          zones: [
            'America/Chicago',
            'America/Denver'
          ],
          days: {
            '3rd monday in February': {
              name: {
                en: "President's Day"
              }
            },
            'friday before 05-01': {
              name: {
                en: 'Arbor Day'
              }
            }
          }
        },
        NV: {
          name: 'Nevada',
          zones: [
            'America/Los_Angeles'
          ],
          days: {
            '3rd monday in February': {
              name: {
                en: 'Presidents Day'
              }
            },
            '2nd monday in October': false,
            '08-09': {
              name: {
                en: "Indigenous Peoples' Day"
              },
              active: [
                {
                  from: '2017-01-01'
                }
              ],
              type: 'observance'
            },
            'friday before 11-01': {
              name: {
                en: 'Nevada Day'
              }
            },
            '4th friday in November': {
              name: {
                en: 'Family Day'
              }
            }
          }
        },
        NH: {
          name: 'New Hampshire',
          zones: [
            'America/New_York'
          ],
          days: {
            '3rd monday in January': {
              name: {
                en: 'Martin Luther King, Jr./ Civil Rights Day'
              }
            },
            '3rd monday in February': {
              name: {
                en: "President's Day"
              }
            },
            '2nd monday in October': {
              type: 'observance'
            },
            'tuesday after 1st monday in November in even years': {
              name: {
                en: 'Election Day'
              }
            },
            'friday after 4th thursday in November': {
              name: {
                en: 'Day after Thanksgiving'
              }
            }
          }
        },
        NJ: {
          name: 'New Jersey',
          zones: [
            'America/New_York'
          ],
          days: {
            '02-12': {
              name: {
                en: "Lincoln's Birthday"
              }
            },
            '3rd monday in February': {
              name: {
                en: 'Presidents Day'
              }
            },
            'easter -2': {
              _name: 'easter -2'
            },
            'tuesday after 1st monday in November': {
              name: {
                en: 'Election Day'
              }
            }
          }
        },
        NM: {
          name: 'New Mexico',
          zones: [
            'America/Denver'
          ],
          days: {
            '3rd monday in February': {
              name: {
                en: "Presidents' Day"
              }
            },
            'friday after 4th thursday in November': {
              name: {
                en: 'Day after Thanksgiving'
              }
            }
          }
        },
        NY: {
          name: 'New York',
          zones: [
            'America/New_York'
          ],
          days: {
            '02-12': {
              name: {
                en: "Lincoln's Birthday"
              }
            },
            '02-15': {
              name: {
                en: 'Susan B. Anthony Day'
              }
            },
            'tuesday after 1st monday in November': {
              name: {
                en: 'Election Day'
              }
            }
          }
        },
        NC: {
          name: 'North Carolina',
          zones: [
            'America/New_York'
          ],
          days: {
            '3rd monday in February': false,
            '2nd monday in October': false,
            'easter -2': {
              _name: 'easter -2'
            },
            'friday after 4th thursday in November': {
              name: {
                en: 'Day after Thanksgiving'
              }
            },
            '12-24 and if friday then previous thursday if saturday,sunday then previous friday': {
              substitute: true,
              _name: '12-24'
            }
          }
        },
        ND: {
          name: 'North Dakota',
          zones: [
            'America/North_Dakota/Center',
            'America/North_Dakota/New_Salem',
            'America/North_Dakota/Beulah'
          ],
          days: {
            '3rd monday in February': {
              name: {
                en: "Presidents' Day"
              }
            }
          }
        },
        OH: {
          name: 'Ohio',
          zones: [
            'America/New_York'
          ],
          days: {
            '3rd monday in February': {
              name: {
                en: 'Washington-Lincoln Day'
              }
            }
          }
        },
        OK: {
          name: 'Oklahoma',
          zones: [
            'America/Chicago'
          ],
          days: {
            '3rd monday in February': {
              name: {
                en: "Presidents' Day"
              }
            },
            'friday after 4th thursday in November': {
              name: {
                en: 'Day after Thanksgiving'
              }
            }
          }
        },
        OR: {
          name: 'Oregon',
          zones: [
            'America/Los_Angeles'
          ],
          days: {
            '3rd monday in February': {
              name: {
                en: 'Presidents Day'
              }
            }
          }
        },
        PA: {
          name: 'Pennsylvania',
          zones: [
            'America/New_York'
          ],
          days: {
            '3rd monday in February': {
              name: {
                en: "Presidents' Day"
              }
            },
            '06-14': {
              name: {
                en: 'Flag Day'
              }
            }
          }
        },
        RI: {
          name: 'Rhode Island',
          zones: [
            'America/New_York'
          ],
          days: {
            '2nd monday in August': {
              name: {
                en: 'Victory Day'
              }
            }
          }
        },
        SC: {
          name: 'South Carolina',
          zones: [
            'America/New_York'
          ],
          days: {
            '05-10': {
              name: {
                en: 'Confederate Memorial Day'
              }
            },
            '12-26': {
              _name: '12-26'
            }
          }
        },
        SD: {
          name: 'South Dakota',
          zones: [
            'America/Chicago',
            'America/Denver'
          ],
          days: {
            '3rd monday in February': {
              name: {
                en: "Presidents' Day"
              }
            },
            '2nd monday in October': {
              name: {
                en: 'Columbus Day'
              },
              active: [
                {
                  to: '2015-01-01'
                }
              ]
            },
            '2nd monday in October #1': {
              name: {
                en: 'Native American Day'
              },
              active: [
                {
                  from: '2015-01-01'
                }
              ]
            }
          }
        },
        TN: {
          name: 'Tennessee',
          zones: [
            'America/Chicago',
            'America/New_York'
          ],
          days: {
            '3rd monday in February': {
              name: {
                en: "President's Day"
              }
            },
            'easter -2': {
              _name: 'easter -2'
            },
            '12-24': {
              _name: '12-24'
            }
          }
        },
        TX: {
          name: 'Texas',
          zones: [
            'America/Chicago',
            'America/Denver'
          ],
          days: {
            '01-19': {
              name: {
                en: 'Confederate Heroes Day'
              },
              type: 'observance',
              note: 'state agencies are partially staffed'
            },
            '3rd monday in February': {
              name: {
                en: "Presidents' Day"
              }
            },
            '03-02': {
              name: {
                en: 'Texas Independence Day'
              },
              type: 'observance',
              note: 'state agencies are partially staffed'
            },
            '03-31': {
              name: {
                en: 'Cesar Chavez Day'
              },
              type: 'observance'
            },
            'easter -2': {
              _name: 'easter -2',
              type: 'observance'
            },
            '04-21': {
              name: {
                en: 'San Jacinto Day'
              },
              type: 'observance',
              note: 'state agencies are partially staffed'
            },
            '06-19': {
              name: {
                en: 'Emancipation Day In Texas'
              },
              type: 'observance',
              note: 'state agencies are partially staffed'
            },
            '08-27': {
              name: {
                en: 'Lyndon Baines Johnson Day'
              },
              type: 'observance',
              note: 'state agencies are partially staffed'
            },
            'friday after 4th thursday in November': {
              name: {
                en: 'Day after Thanksgiving'
              }
            },
            '12-24': {
              _name: '12-24'
            },
            '12-26': {
              _name: '12-26',
              name: {
                en: 'Day after Christmas'
              }
            }
          }
        },
        UT: {
          name: 'Utah',
          zones: [
            'America/Denver'
          ],
          days: {
            '3rd monday in February': {
              name: {
                en: 'Washington and Lincoln Day'
              }
            },
            '07-24': {
              name: {
                en: 'Pioneer Day'
              }
            }
          }
        },
        VT: {
          name: 'Vermont',
          zones: [
            'America/New_York'
          ],
          days: {
            '3rd monday in February': {
              name: {
                en: "Presidents' Day"
              }
            },
            '1st tuesday in March': {
              name: {
                en: 'Town Meeting Day'
              }
            },
            '3rd monday in August': {
              name: {
                en: 'Bennington Battle Day'
              }
            },
            '2nd monday in October': {
              name: {
                en: 'Columbus Day'
              },
              active: [
                {
                  to: '2017-09-01'
                }
              ]
            },
            '2nd monday in October #1': {
              name: {
                en: "Indigenous Peoples' Day"
              },
              active: [
                {
                  from: '2017-09-01'
                }
              ]
            }
          }
        },
        VA: {
          name: 'Virginia',
          zones: [
            'America/New_York'
          ],
          days: {
            '3rd monday in February': {
              name: {
                en: 'George Washington Day'
              }
            },
            'friday before 3rd monday in January': {
              name: {
                en: 'Lee–Jackson Day'
              }
            }
          }
        },
        WA: {
          name: 'Washington',
          zones: [
            'America/Los_Angeles'
          ],
          days: {
            '3rd monday in February': {
              name: {
                en: "Presidents' Day"
              }
            }
          }
        },
        WV: {
          name: 'West Virginia',
          zones: [
            'America/New_York'
          ],
          days: {
            '02-15': {
              name: {
                en: 'Susan B. Anthony Day'
              }
            },
            '3rd monday in February': {
              name: {
                en: "President's Day"
              }
            },
            '06-20': {
              name: {
                en: 'West Virginia Day'
              }
            },
            '4th friday in November': {
              name: {
                en: "Lincoln's Day"
              }
            }
          }
        },
        WI: {
          name: 'Wisconsin',
          zones: [
            'America/Chicago'
          ],
          days: {
            '02-15': {
              name: {
                en: 'Susan B. Anthony Day'
              }
            },
            '2nd tuesday in September': {
              name: {
                en: 'Primary Election Day'
              }
            },
            'tuesday after 1st monday in November': {
              name: {
                en: 'Election Day'
              }
            }
          }
        },
        WY: {
          name: 'Wyoming',
          zones: [
            'America/Denver'
          ],
          days: {
            '3rd monday in February': {
              name: {
                en: "President's Day"
              }
            }
          }
        }
      }
    },
    UY: {
      names: {
        es: 'Uruguay',
        en: 'Uruguay'
      },
      dayoff: 'sunday',
      langs: [
        'es'
      ],
      zones: [
        'America/Montevideo'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-06': {
          _name: '01-06',
          type: 'observance'
        },
        'easter -48': {
          name: {
            en: 'Carnival',
            es: 'Carnaval'
          },
          type: 'observance'
        },
        'easter -47': {
          _name: 'easter -47',
          type: 'observance'
        },
        'easter -6 P5D': {
          name: {
            en: 'Tourism Week',
            es: 'Semana de Turismo'
          },
          type: 'observance'
        },
        'easter -3': {
          _name: 'easter -3'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        '04-19 if tuesday,wednesday then previous monday if thursday,friday then next monday': {
          name: {
            en: 'Landing of the 33 Orientals',
            es: 'Desembarco de los 33 Orientales'
          },
          type: 'observance'
        },
        '05-01': {
          _name: '05-01'
        },
        '05-18 if tuesday,wednesday then previous monday if thursday,friday then next monday': {
          name: {
            en: 'Battle of Las Piedras',
            es: 'Batalla de las Piedras'
          },
          type: 'observance'
        },
        '06-19': {
          name: {
            en: 'Birthday of José Gervasio Artigas and Never Again Day',
            es: 'Natalicio de Artigas y Día del Nunca Más'
          },
          type: 'observance'
        },
        '07-18': {
          _name: 'Constitution Day'
        },
        '08-25': {
          _name: 'Independence Day'
        },
        '10-12 if tuesday,wednesday then previous monday if thursday,friday then next monday': {
          name: {
            en: 'Columbus Day',
            es: 'Día de la Raza'
          },
          type: 'observance'
        },
        '11-02': {
          _name: '11-02',
          type: 'observance'
        },
        '12-24': {
          _name: '12-24',
          type: 'observance'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-31': {
          _name: '12-31',
          type: 'observance'
        }
      }
    },
    VA: {
      names: {
        it: 'Stato della Città del Vaticano',
        la: 'Status Civitatis Vaticanae',
        en: 'Vatican City'
      },
      langs: [
        'it'
      ],
      zones: [
        'Europe/Rome'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          name: {
            en: 'Solemnity of Mary, Mother of God',
            it: 'Maria Santissima Madre di Dio'
          }
        },
        '01-06': {
          name: {
            en: 'Epiphany',
            it: 'Epifania del Signore'
          }
        },
        '02-11': {
          name: {
            en: 'Anniversary of the foundation of Vatican City',
            it: 'Anniversario della istituzione dello Stato della Città del Vaticano'
          }
        },
        '03-19': {
          _name: '03-19'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        'easter 39': {
          _name: 'easter 39',
          active: [
            {
              to: 2009
            }
          ]
        },
        'easter 60': {
          _name: 'easter 60',
          active: [
            {
              to: 2009
            }
          ]
        },
        '05-01': {
          _name: '05-01',
          name: {
            en: 'Saint Joseph the Worker',
            it: 'San Giuseppe lavoratore'
          }
        },
        '06-29': {
          _name: '06-29'
        },
        '08-15': {
          _name: '08-15',
          name: {
            it: 'Assunzione di Maria in Cielo'
          }
        },
        '09-08': {
          name: {
            en: 'Nativity of Mary',
            it: 'Festa della natività della madonna'
          }
        },
        '11-01': {
          _name: '11-01'
        },
        '12-08': {
          _name: '12-08'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        },
        '10-16': {
          name: {
            en: 'Anniversary of the election of Pope John Paul II',
            it: "Anniversario dell'Elezione del Santo Padre"
          },
          active: [
            {
              from: 1978,
              to: 2005
            }
          ]
        },
        '11-04': {
          name: {
            en: 'Saint Charles Borromeo - Name day of the Holy Father',
            it: 'San Carlo Borromeo - Onomastico del Santo Padre'
          },
          note: 'Name day of Pope John Paul II (Karol Józef Wojtyła)',
          active: [
            {
              from: 1978,
              to: 2005
            }
          ]
        },
        '04-19': {
          name: {
            en: 'Anniversary of the election of Pope Benedict XVI',
            it: "Anniversario dell'Elezione del Santo Padre"
          },
          active: [
            {
              from: 2005,
              to: 2013
            }
          ]
        },
        '03-19#1': {
          name: {
            en: 'Saint Joseph - Name day of the Holy Father',
            it: 'San Giuseppe - Onomastico del Santo Padre'
          },
          note: 'Name day of Pope Benedict XVI (Josef Ratzinger)',
          active: [
            {
              from: 2005,
              to: 2013
            }
          ]
        },
        '03-13': {
          name: {
            en: 'Anniversary of the election of Pope Francis',
            it: "Anniversario dell'Elezione del Santo Padre"
          },
          active: [
            {
              from: 2013
            }
          ]
        },
        '04-23': {
          name: {
            en: 'Saint George - Name day of the Holy Father',
            it: 'San Giorgio - Onomastico del Santo Padre'
          },
          note: 'Name day of Pope Francis (Jorge Mario Bergoglio)',
          active: [
            {
              from: 2013
            }
          ]
        }
      }
    },
    VC: {
      names: {
        en: 'St. Vincent & Grenadines'
      },
      langs: [
        'en'
      ],
      zones: [
        'America/Port_of_Spain'
      ],
      dayoff: 'sunday',
      days: {
        '01-01 and if Sunday then next Monday': {
          substitute: true,
          _name: '01-01'
        },
        '03-14 and if Sunday then next Monday': {
          substitute: true,
          name: {
            en: 'National Hero′s Day'
          }
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01 and if Sunday then next Monday': {
          substitute: true,
          _name: '05-01'
        },
        'easter 50': {
          _name: 'easter 50'
        },
        '1st Monday in July': {
          name: {
            en: 'Carnival Monday'
          },
          disable: [
            '2021-06-05'
          ],
          enable: [
            '2021-09-06'
          ]
        },
        'Tuesday after 1st Monday in July': {
          name: {
            en: 'Carnival Tuesday'
          },
          disable: [
            '2021-06-06'
          ],
          enable: [
            '2021-09-07'
          ]
        },
        '08-01 and if Sunday then next Monday': {
          substitute: true,
          name: {
            en: 'Emancipation Day'
          }
        },
        '10-27 and if Sunday then next Monday': {
          substitute: true,
          _name: 'Independence Day'
        },
        '12-25 and if Sunday then next Tuesday': {
          substitute: true,
          _name: '12-25'
        },
        '12-26 and if Sunday then next Monday': {
          substitute: true,
          _name: '12-26'
        }
      }
    },
    VE: {
      names: {
        es: 'Venezuela',
        en: 'Venezuela'
      },
      dayoff: 'sundays',
      langs: [
        'es'
      ],
      zones: [
        'America/Caracas'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        '01-06': {
          _name: '01-06',
          type: 'observance'
        },
        '01-15': {
          name: {
            es: 'Día del Maestro',
            en: "Teacher's Day"
          },
          type: 'optional',
          note: 'teachers only'
        },
        '03-19': {
          _name: '03-19',
          type: 'observance'
        },
        'easter -48': {
          name: {
            en: 'Carnival',
            es: 'Carnaval'
          }
        },
        'easter -47': {
          _name: 'easter -47'
        },
        'easter -6 P7D': {
          name: {
            en: 'Holy Week',
            es: 'Semana Santa'
          },
          type: 'observance'
        },
        'easter -3': {
          _name: 'easter -3'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter'
        },
        '04-19': {
          name: {
            en: 'Declaration of Independence',
            es: 'Declaración de la Independencia'
          }
        },
        '05-01': {
          _name: '05-01'
        },
        '06-24': {
          name: {
            en: 'Battle of Carabobo',
            es: 'Aniversario de la Batalla de Carabobo'
          }
        },
        '07-05': {
          _name: 'Independence Day'
        },
        '07-24': {
          name: {
            en: 'Birthday of Simón Bolívar',
            es: 'Natalicio de Simón Bolívar'
          }
        },
        '08-03': {
          name: {
            en: 'Flag Day',
            es: 'Día de la Bandera'
          },
          type: 'observance'
        },
        '09-11': {
          name: {
            en: 'Our Lady of Coromoto',
            es: 'Día de Nuestra Señora de Coromoto'
          },
          type: 'observance'
        },
        '10-12': {
          name: {
            en: 'Day of Indigenous Resistance',
            es: 'Día de la resistencia indígena'
          }
        },
        '11-01': {
          _name: '11-01',
          type: 'observance'
        },
        '11-02': {
          _name: '11-02',
          type: 'observance'
        },
        '12-08': {
          _name: '12-08',
          type: 'observance'
        },
        '12-10': {
          name: {
            en: 'Venezuelan Air Force Day',
            es: 'Día de la Aviación Nacional'
          },
          type: 'observance'
        },
        '12-24': {
          _name: '12-24'
        },
        '12-25': {
          _name: '12-25'
        },
        '12-31': {
          _name: '12-31'
        }
      },
      states: {
        B: {
          name: 'Anzoátegui',
          days: {
            '11-14': {
              name: {
                es: 'Natalicio de José Antonio Anzoátegui'
              }
            }
          }
        },
        G: {
          name: 'Carabobo',
          days: {
            '11-13': {
              name: {
                es: 'Día de la Virgen del Socorro'
              }
            }
          }
        },
        K: {
          name: 'Lara',
          days: {
            '01-14': {
              name: {
                es: 'Día de La Divina Pastora'
              }
            },
            '05-28': {
              name: {
                es: 'Natalicio de Jacinto Lara'
              }
            }
          },
          regions: {
            BA: {
              name: 'Barquisimeto',
              days: {
                '09-14': {
                  name: {
                    es: 'Día de Barquisimeto'
                  }
                }
              }
            }
          }
        },
        M: {
          name: 'Miranda',
          days: {
            '03-19': {
              _name: '03-19'
            }
          }
        },
        N: {
          name: 'Monagas',
          days: {
            '12-07': {
              name: {
                es: 'Día de Maturin'
              }
            }
          }
        },
        S: {
          name: 'Táchira',
          days: {
            '08-15': {
              _name: '08-15',
              name: {
                es: 'Día de la Virgen de Consolación'
              }
            }
          }
        },
        V: {
          name: 'Zulia',
          days: {
            '10-24': {
              name: {
                es: 'Natalicio de Rafael Urdaneta'
              }
            },
            '11-18': {
              name: {
                es: 'Día de la Virgen de la Chinita'
              }
            }
          }
        }
      }
    },
    VG: {
      names: {
        en: 'British Virgin Islands'
      },
      langs: [
        'en'
      ],
      zones: [
        'America/Port_of_Spain'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        'Monday before 03-08': {
          name: {
            en: 'The Anniversary of the Birth of Hamilton Lavity Stoutt'
          }
        },
        '2nd Monday in March': {
          name: {
            en: 'Commonwealth Day'
          }
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        'easter 49': {
          _name: 'easter 49',
          type: 'observance'
        },
        'easter 50': {
          _name: 'easter 50'
        },
        '2nd Saturday after 06-02 prior to 2020': {
          name: {
            en: 'Sovereign’s Birthday'
          },
          disable: [
            '2017-06-10',
            '2019-06-15'
          ],
          enable: [
            '2017-06-17',
            '2019-06-07'
          ]
        },
        '2nd Friday after 06-02 since 2020': {
          name: {
            en: 'Sovereign’s Birthday'
          }
        },
        '07-01 if Sunday,Thursday then next Monday if Saturday then previous Friday if Tuesday,Wednesday then previous Monday': {
          name: {
            en: 'Virgin Islands Day'
          }
        },
        '10-21 if Sunday then next Monday if Saturday then previous Friday if Tuesday,Wednesday then previous Monday if Thursday then next Friday': {
          name: {
            en: 'St. Ursula’s Day'
          },
          disable: [
            '2016-10-23',
            '2020-10-19',
            '2021-10-22'
          ],
          enable: [
            '2016-10-19',
            '2020-10-23'
          ]
        },
        '1st Monday in August': {
          name: {
            en: 'Emancipation Monday'
          }
        },
        'Tuesday after 1st Monday in August': {
          name: {
            en: 'Emancipation Tuesday'
          }
        },
        'Wednesday after 1st Monday in August': {
          name: {
            en: 'Emancipation Wednesday'
          }
        },
        '2021-10-18': {
          name: {
            en: 'Heroes’ and Forefathers Day'
          }
        },
        '2021-11-08': {
          name: {
            en: 'Commemoration of the Great March of 1949'
          }
        },
        '12-25 and if Saturday then next Monday if Sunday then next Tuesday': {
          substitute: true,
          _name: '12-25'
        },
        '12-26 and if Saturday then next Monday if Sunday then next Tuesday': {
          substitute: true,
          _name: '12-26'
        }
      }
    },
    VI: {
      names: {
        en: 'U.S. Virgin Islands'
      },
      langs: [
        'en'
      ],
      zones: [
        'America/Port_of_Spain'
      ],
      dayoff: 'sunday',
      _days: 'US',
      days: {
        '01-06': {
          _name: '01-06',
          name: {
            en: 'Three Kings Day'
          }
        },
        '3rd monday in February': {
          name: {
            en: "President's Day"
          }
        },
        '03-17': false,
        '03-31': {
          name: {
            en: 'Transfer Day'
          }
        },
        'easter -3': {
          _name: 'easter -3'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '07-03': {
          name: {
            en: 'Emancipation Day'
          }
        },
        '4th Monday in July': {
          name: {
            en: 'Hurricane Supplication Day'
          }
        },
        '2nd monday in October': {
          name: {
            en: 'Virgin Islands–Puerto Rico Friendship Day'
          }
        },
        '10-25': {
          name: {
            en: 'Hurricane Thanksgiving'
          },
          type: 'observance'
        },
        'friday after 4th thursday in November': {
          name: {
            en: 'Day after Thanksgiving Day'
          },
          type: 'school'
        }
      }
    },
    VN: {
      names: {
        vi: 'Cộng hòa Xã hội chủ nghĩa Việt Nam',
        en: 'Vietnam'
      },
      dayoff: '',
      langs: [
        'vi'
      ],
      zones: [
        'Asia/Ho_Chi_Minh',
        'Asia/Bangkok'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        'vietnamese 1-0-1': {
          name: {
            en: 'Vietnamese New Year',
            vi: 'Tết Nguyên Đán'
          }
        },
        '1 day before vietnamese 1-0-1 P5D': {
          name: {
            en: 'Vietnamese New Year Holidays',
            vi: 'Giao thừa Tết Nguyên Đán'
          }
        },
        'vietnamese 3-0-10': {
          name: {
            en: 'Hung Kings Commemorations',
            vi: 'Giỗ tổ Hùng Vương'
          }
        },
        '04-30': {
          name: {
            en: 'Day of liberating the South for national reunification',
            vi: 'Ngày Giải phóng miền Nam'
          }
        },
        '05-01': {
          _name: '05-01'
        },
        '09-02': {
          name: {
            en: 'National Day',
            vi: 'Quốc khánh'
          }
        },
        '02-03': {
          name: {
            en: 'Communist Party of Viet Nam Foundation Anniversary',
            vi: 'Ngày thành lập Đảng'
          },
          type: 'observance'
        },
        '03-08': {
          _name: '03-08',
          type: 'observance'
        },
        '04-21': {
          name: {
            en: 'Vietnam Book Day',
            vi: 'Ngày Sách Việt Nam'
          },
          type: 'observance'
        },
        '05-07': {
          name: {
            en: 'Dien Bien Phu Victory Day',
            vi: 'Ngày Chiến thắng Điện Biện Phủ'
          },
          type: 'observance'
        },
        '05-19': {
          name: {
            en: "President Ho Chi Minh's Birthday",
            vi: 'Ngày sinh Chủ tịch Hồ Chí Minh'
          },
          type: 'observance'
        },
        '06-01': {
          name: {
            en: "International Children's Day",
            vi: 'Ngày quốc tế Thiếu nhi'
          },
          type: 'observance'
        },
        '06-28': {
          name: {
            en: 'Vietnamese Family Day',
            vi: 'Ngày Gia đình Việt Nam'
          },
          type: 'observance'
        },
        '07-27': {
          name: {
            en: 'Remembrance Day',
            vi: 'Ngày Thương Binh Liệt Sĩ'
          },
          type: 'observance'
        },
        '08-19': {
          name: {
            en: 'August Revolution Commemoration Day',
            vi: 'Ngày cách mạng Tháng Tám'
          },
          type: 'observance'
        },
        '10-10': {
          name: {
            en: 'Capital Liberation Day',
            vi: 'Ngày giải phóng Thủ Đô'
          },
          type: 'observance'
        },
        '10-20': {
          name: {
            en: "Vietnamese Women's Day",
            vi: 'Ngày Phụ nữ Việt Nam'
          },
          type: 'observance'
        },
        '11-20': {
          name: {
            en: "Vietnamese Teacher's Day",
            vi: 'Ngày Nhà giáo Việt Nam'
          },
          type: 'observance'
        },
        '12-22': {
          name: {
            en: 'National Defence Day',
            vi: 'Ngày hội Quốc phòng Toàn dân'
          },
          type: 'observance'
        },
        'vietnamese 1-0-5': {
          name: {
            en: 'Victory of Ngọc Hồi-Đống Đa',
            vi: 'Chiến thắng Ngọc Hồi - Đống Đa'
          },
          type: 'observance'
        },
        'vietnamese 1-0-15': {
          name: {
            en: 'Lantern Festival',
            vi: 'Tết Nguyên Tiêu'
          },
          type: 'observance'
        },
        'vietnamese 4-0-15': {
          name: {
            en: "Buddha's Birthday",
            vi: 'Lễ Phật đản'
          },
          type: 'observance'
        },
        'vietnamese 5-0-5': {
          name: {
            en: 'Mid-year Festival',
            vi: 'Tết Đoan ngọ'
          },
          type: 'observance'
        },
        'vietnamese 7-0-15': {
          name: {
            en: 'Ghost Festival',
            vi: 'Rằm Tháng Bảy, Vu Lan'
          },
          type: 'observance'
        },
        'vietnamese 8-0-15': {
          name: {
            en: 'Mid-Autumn Festival',
            vi: 'Tết Trung thu'
          },
          type: 'observance'
        },
        'vietnamese 12-0-23': {
          name: {
            en: 'Kitchen guardians',
            vi: 'Ông Táo chầu trời'
          },
          type: 'observance'
        }
      }
    },
    VU: {
      names: {
        en: 'Vanuatu',
        fr: 'République de Vanuatu'
      },
      langs: [
        'fr',
        'en',
        'bi'
      ],
      zones: [
        'Pacific/Efate'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        '02-21': {
          name: "Mémoire du père de l'indépendance Rév. Dr. W.H. Lini"
        },
        '02-22': {
          _name: 'Public Holiday'
        },
        '03-05': {
          name: 'Fête des chefs coutumiers'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01': {
          _name: '05-01'
        },
        'easter 39': {
          _name: 'easter 39'
        },
        '07-24': {
          name: 'Journée Mondiale des Enfants'
        },
        '07-30': {
          _name: 'Independence Day'
        },
        '08-15': {
          _name: '08-15'
        },
        '08-16': {
          _name: 'Public Holiday'
        },
        '10-05': {
          _name: 'Constitution Day'
        },
        '10-29': {
          name: "Jour de l'Unité"
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          name: 'Fête de Famille'
        },
        '12-27': {
          _name: 'Public Holiday'
        }
      }
    },
    XK: {
      names: {
        sq: 'Republika e Kosovës',
        sr: 'Република Косово',
        en: 'Kosovo'
      },
      langs: [
        'sq',
        'sr'
      ],
      zones: [
        'Europe/Belgrade'
      ],
      dayoff: 'sunday',
      days: {
        '01-01': {
          _name: '01-01'
        },
        'julian 12-25': {
          _name: 'julian 12-25'
        },
        '02-17': {
          _name: 'Independence Day'
        },
        '04-09': {
          _name: 'Constitution Day'
        },
        easter: {
          _name: 'easter'
        },
        orthodox: {
          _name: 'orthodox'
        },
        '05-01': {
          _name: '05-01'
        },
        '05-09': {
          _name: '05-09'
        },
        '12-25': {
          _name: '12-25'
        },
        '1 Shawwal': {
          _name: '1 Shawwal'
        },
        '10 Dhu al-Hijjah': {
          _name: '10 Dhu al-Hijjah'
        }
      }
    },
    YT: {
      names: {
        fr: 'Mayotte',
        en: 'Mayotte'
      },
      langs: [
        'fr'
      ],
      zones: [
        'Africa/Nairobi'
      ],
      dayoff: 'sunday',
      _days: 'FR',
      days: {
        '04-27': {
          _name: 'Abolition of Slavery'
        }
      }
    },
    ZA: {
      names: {
        en: 'South Africa'
      },
      dayoff: 'sunday',
      langs: [
        'en'
      ],
      zones: [
        'Africa/Johannesburg'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        'substitutes 01-01 if sunday then next monday': {
          name: {
            en: 'Public Holiday'
          }
        },
        '03-21': {
          name: {
            en: 'Human Rights Day'
          }
        },
        'substitutes 03-21 if sunday then next monday': {
          name: {
            en: 'Public Holiday'
          }
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1',
          name: {
            en: 'Family Day'
          }
        },
        '04-27': {
          name: {
            en: 'Freedom Day'
          }
        },
        'substitutes 04-27 if sunday then next monday': {
          name: {
            en: 'Public Holiday'
          }
        },
        '05-01': {
          _name: '05-01',
          name: {
            en: "Workers' Day"
          }
        },
        'substitutes 05-01 if sunday then next monday': {
          name: {
            en: 'Public Holiday'
          }
        },
        '2nd sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        '06-16': {
          name: {
            en: 'Youth Day'
          }
        },
        'substitutes 06-16 if sunday then next monday': {
          name: {
            en: 'Public Holiday'
          }
        },
        '3rd sunday in June': {
          _name: 'Fathers Day',
          type: 'observance'
        },
        '08-09': {
          name: {
            en: "National Women's Day"
          }
        },
        'substitutes 08-09 if sunday then next monday': {
          name: {
            en: 'Public Holiday'
          }
        },
        '07-18': {
          name: {
            en: 'Nelson Mandela Day'
          },
          type: 'observance'
        },
        '09-24': {
          name: {
            en: 'Heritage Day'
          }
        },
        'substitutes 09-24 if sunday then next monday': {
          name: {
            en: 'Public Holiday'
          }
        },
        '12-16': {
          name: {
            en: 'Day of Reconciliation'
          }
        },
        'substitutes 12-16 if sunday then next monday': {
          name: {
            en: 'Public Holiday'
          }
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26',
          name: {
            en: 'Day of Goodwill'
          }
        },
        'substitutes 12-26 if sunday then next monday': {
          name: {
            en: 'Public Holiday'
          }
        }
      }
    },
    ZM: {
      names: {
        en: 'Zambia'
      },
      dayoff: 'sunday',
      langs: [
        'en'
      ],
      zones: [
        'Africa/Maputo'
      ],
      days: {
        '01-01 and if sunday then next monday': {
          substitute: true,
          _name: '01-01'
        },
        '03-09': {
          name: {
            en: 'Women’s Day'
          }
        },
        '03-12 and if sunday then next monday': {
          substitute: true,
          name: {
            en: 'Youth Day'
          }
        },
        'easter -2': {
          _name: 'easter -2'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '05-01 and if sunday then next monday': {
          substitute: true,
          _name: '05-01'
        },
        '05-25 and if sunday then next monday': {
          substitute: true,
          name: {
            en: 'African Freedom Day'
          }
        },
        '1st monday in July': {
          name: {
            en: "Heroes' Day"
          }
        },
        'tuesday after 1st monday in July': {
          name: {
            en: 'Unity Day'
          }
        },
        '1st monday in August': {
          name: {
            en: "Farmers' Day"
          }
        },
        '2015-10-18': {
          name: {
            en: 'National day of Prayers'
          }
        },
        '10-24 and if sunday then next monday': {
          substitute: true,
          _name: 'Independence Day'
        },
        '12-25 and if sunday then next monday': {
          substitute: true,
          _name: '12-25'
        }
      }
    },
    ZW: {
      names: {
        sn: 'Nyika yeZimbabwe',
        nd: 'iRiphabhuliki yeZimbabwe',
        xh: 'iRiphubliki eyeZimbabwe',
        kck: 'Nyika yeZimbabwe',
        en: 'Zimbabwe'
      },
      dayoff: 'sunday',
      langs: [
        'en'
      ],
      zones: [
        'Africa/Maputo'
      ],
      days: {
        '01-01': {
          _name: '01-01'
        },
        'easter -2': {
          _name: 'easter -2'
        },
        easter: {
          _name: 'easter',
          type: 'observance'
        },
        'easter 1': {
          _name: 'easter 1'
        },
        '04-18': {
          _name: 'Independence Day'
        },
        '05-01': {
          _name: '05-01'
        },
        '05-25': {
          name: {
            en: 'Africa Day'
          }
        },
        '2nd sunday in May': {
          _name: 'Mothers Day',
          type: 'observance'
        },
        '3rd sunday in June': {
          _name: 'Fathers Day',
          type: 'observance'
        },
        '2nd monday in August': {
          name: {
            en: "Heroes' Day"
          }
        },
        '2nd tuesday in August': {
          name: {
            en: 'Defence Forces Day'
          }
        },
        '12-22': {
          name: {
            en: 'Unity Day'
          }
        },
        '12-25': {
          _name: '12-25'
        },
        '12-26': {
          _name: '12-26'
        }
      }
    }
  },
  names: {
    '01-01': {
      name: {
        en: "New Year's Day",
        am: 'እንቁጣጣሽ',
        ar: 'عيد رأس السنة',
        az: 'Yeni il',
        be: 'Новы год',
        bg: 'Нова Година',
        bs: 'Novogodisnji dan',
        ca: 'Any nou',
        cz: 'Nový rok',
        da: 'Nytår',
        de: 'Neujahr',
        el: 'Πρωτοχρονιά',
        es: 'Año Nuevo',
        et: 'uusaasta',
        fi: 'Uudenvuodenpäivä',
        fil: 'Araw ng Bagong Taon',
        fo: 'Nýggjársdagur',
        fr: 'Nouvel An',
        ge: 'ახალი წელი',
        hr: 'Nova godina',
        hu: 'Újév',
        hy: 'Ամանոր',
        id: 'Hari tahun baru',
        it: 'Capodanno',
        is: 'Nýársdagur',
        jp: '元日',
        kl: 'ukiortaaq',
        ko: '신정',
        lt: 'Naujieji metai',
        lv: 'Jaunais Gads',
        mg: 'Taom-baovao',
        mk: 'Нова Година',
        ms: 'Hari Tahun Baru',
        mt: 'L-Ewwel tas-Sena',
        nl: 'Nieuwjaar',
        no: 'Første nyttårsdag',
        pap: 'Aña Nobo',
        pl: 'Nowy Rok',
        pt: 'Ano Novo',
        ro: 'Anul nou',
        ru: 'Новый год',
        sl: 'Novo leto',
        sq: 'Viti i Ri',
        sr: 'Нова година',
        sv: 'Nyårsdagen',
        sw: 'Mwaka mpya',
        ti: 'ሓዲሽ ዓመት',
        tr: 'Yılbaşı',
        uk: 'Новий Рік',
        vi: 'Tết Dương lịch',
        zh: '元旦'
      }
    },
    '01-06': {
      name: {
        en: 'Epiphany',
        am: 'ብርሐነ ጥምቀት',
        da: 'Åbenbaring',
        de: 'Heilige Drei Könige',
        'de-ch': 'Dreikönigstag',
        es: 'Día de los Reyes Magos',
        et: 'kolmekuningapäev',
        fi: 'Loppiainen',
        fr: "l'Épiphanie",
        el: 'Θεοφάνεια',
        hr: 'Bogojavljenje, Sveta tri kralja',
        hu: 'Vízkereszt',
        it: 'Befana',
        is: 'Þrettándinn',
        nl: 'Driekoningen',
        mk: 'Богојавление',
        pl: 'Święto Trzech Króli',
        sk: 'Zjavenie Pána',
        sv: 'Trettondedag jul',
        ti: 'ጥምቀት',
        vi: 'Lễ Hiển Linh'
      }
    },
    '02-02': {
      name: {
        en: 'Candlemas',
        de: 'Lichtmess',
        hu: 'Gyertyaszentelő Boldogasszony',
        nl: 'Lichtmis',
        vi: 'Lễ Đức Mẹ dâng Chúa Giêsu trong đền thánh'
      }
    },
    '02-14': {
      name: {
        en: "Valentine's Day",
        de: 'Valentinstag',
        fr: 'Saint-Valentin',
        hu: 'Valentin nap',
        nl: 'Valentijnsdag',
        vi: 'Lễ tình nhân'
      }
    },
    '03-08': {
      name: {
        en: "International Women's Day",
        az: 'Qadınlar günü',
        be: 'Мiжнародны жаночы дзень',
        bg: 'Ден на жената',
        de: 'Internationaler Frauentag',
        fr: 'Journée internationale des femmes',
        ge: 'ქალთა საერთაშორისო დღე',
        hu: 'Nemzetközi nőnap',
        hy: 'Կանանց տոն',
        nl: 'Internationale Vrouwendag',
        pt: 'Dia Internacional da Mulher',
        ro: 'Ziua Internationala a Femeii',
        ru: 'Международный женский день',
        sl: 'Mednarodni dan žena',
        uk: 'Міжнародний жіночий день',
        vi: 'Quốc tế Phụ nữ',
        zh: '国际妇女节',
        ti: 'መዓልቲ ኣነስቲ'
      }
    },
    '03-19': {
      name: {
        en: 'Saint Joseph',
        'de-at': 'Josefitag',
        de: 'Josefstag',
        es: 'San José',
        it: 'San Giuseppe',
        mt: 'San Ġużepp',
        nl: 'Hoogfeest van de Heilige Jozef',
        vi: 'Kính Thánh Giuse'
      }
    },
    '04-01': {
      name: {
        en: "April Fools' Day",
        hu: 'Bolondok napja',
        nl: '1 April',
        sq: 'Dita e Gënjeshtrave',
        vi: 'Cá tháng tư'
      }
    },
    '05-01': {
      name: {
        en: 'Labour Day',
        'en-us': 'Labor Day',
        ar: 'يوم العمال',
        be: 'Дзень працы',
        bg: 'Ден на труда',
        bs: 'Radni dan',
        cz: 'Svátek práce',
        da: '1. maj',
        de: 'Tag der Arbeit',
        el: 'Εργατική Πρωτομαγιά',
        es: 'Día del trabajador',
        et: 'kevadpüha',
        fi: 'Vappu',
        fil: 'Araw ng mga Manggagawa',
        fr: 'Fête du travail',
        hr: 'Praznik rada',
        hu: 'A munka ünnepe',
        hy: 'Աշխատանքի օր',
        id: 'Hari Buruh Internasional',
        it: 'Festa del Lavoro',
        is: 'Hátíðisdagur Verkamanna',
        lt: 'Tarptautinė darbo diena',
        lv: 'Darba svētki',
        nl: 'Dag van de Arbeid',
        no: 'Arbeidernes dag',
        mg: "Fetin'ny asa",
        mk: 'Ден на трудот',
        ms: 'Hari Pekerja',
        mt: 'Jum il-Ħaddiem',
        pap: 'Dia di Obrero',
        pl: 'Święto Pracy',
        pt: 'Dia do trabalhador',
        ro: 'Ziua muncii',
        sk: 'Sviatok práce',
        sl: 'Praznik dela',
        sq: 'Dita Ndërkombëtare e Punonjësve',
        sr: 'Празник рада',
        sv: 'Första Maj',
        ti: 'የላብ አደሮች ቀን',
        uk: 'День міжнародної солідарності трудящих',
        vi: 'Quốc tế Lao động',
        zh: '劳动节'
      }
    },
    '05-09': {
      name: {
        en: 'Europe Day',
        bg: 'Денят на Европа',
        cs: 'Den Evropy',
        da: 'Europadagen',
        de: 'Europatag',
        el: 'Ημέρα της Ευρώπης',
        es: 'Día de Europa',
        et: 'Euroopa päev',
        fi: 'Eurooppa-päivä',
        fr: "Journée de l'Europe",
        ga: 'Lá na hEorpa',
        hr: 'Dan Europe',
        hu: 'Európa-nap',
        it: "Festa dell'Europa",
        ls: 'Dan Evrope',
        lt: 'Europos diena',
        lv: 'Eiropas diena',
        mt: 'Jum l-Ewropa',
        nl: 'Dag van Europa ou Europadag',
        pl: 'Dzień Europy',
        pt: 'Dia da Europa',
        ro: 'Ziua Europei',
        sk: 'Deň Európy',
        sq: 'Dita e Evropës',
        sv: 'Europadagen'
      }
    },
    '06-29': {
      name: {
        en: 'Saints Peter and Paul',
        de: 'Peter und Paul',
        es: 'San Pedro y San Pablo',
        fr: 'Saint Pierre et Paul',
        it: 'Santi Pietro e Paolo',
        mt: 'L-Imnarja',
        nl: 'Hoogfeest van Petrus en Paulus',
        vi: 'Lễ kính Thánh Phêrô'
      }
    },
    '08-15': {
      name: {
        en: 'Assumption',
        de: 'Mariä Himmelfahrt',
        es: 'Asunción',
        fr: 'Assomption',
        el: 'Κοίμηση της Θεοτόκου',
        hr: 'Velika Gospa',
        it: 'Ferragosto',
        lt: 'Žolinė',
        mg: 'Asompsiona',
        mk: 'Успение на Пресвета Богородица',
        mt: 'Santa Marija',
        nl: 'O.L.V. Hemelvaart',
        pl: 'Wniebowzięcie Najświętszej Maryi Panny',
        pt: 'Assunção de Maria',
        ro: 'Adormirea Maicii Domnului',
        sl: 'Marijino vnebovzetje',
        sq: 'Shën Mëria e Gushtit',
        vi: 'Đức Mẹ Lên Trời'
      }
    },
    '11-01': {
      name: {
        en: "All Saints' Day",
        bs: 'Dita e të gjithë Shenjtorëve',
        de: 'Allerheiligen',
        es: 'Todos los Santos',
        fi: 'Pyhäinpäivä',
        fil: 'Undás; Todos los Santos; Araw ng mga Santo',
        fr: 'Toussaint',
        hr: 'Svi sveti',
        hu: 'Mindenszentek',
        it: 'Ognissanti',
        lt: 'Visų šventųjų diena',
        mg: "Fetin'ny olo-masina",
        mk: 'Празникот на сите светци',
        nl: 'Allerheiligen',
        pl: 'Wszystkich Świętych',
        pt: 'Todos os santos',
        sk: 'Sviatok všetkých svätých',
        sq: 'Të gjitha Saints',
        sr: 'Сви Свети',
        sv: 'Alla Helgons dag',
        vi: 'Lễ Các Thánh'
      }
    },
    '11-02': {
      name: {
        en: "All Souls' Day",
        de: 'Allerseelen',
        es: 'Día de los Difuntos',
        et: 'hingedepäev',
        fil: 'Araw ng mga Kaluluwa',
        fr: 'Fête des morts',
        hr: 'Dušni dan',
        hu: 'Halottak napja',
        nl: 'Allerzielen',
        pt: 'Dia de Finados',
        vi: 'Lễ Các Đẳng',
        lt: 'Vėlinės'
      }
    },
    '11-11': {
      name: {
        en: 'Saint Martin',
        de: 'Sankt Martin (Faschingsbeginn)',
        hu: 'Márton nap',
        nl: 'Sint Maarten',
        vi: 'Lễ thánh Martin'
      }
    },
    '12-06': {
      name: {
        en: 'Saint Nicholas',
        de: 'Sankt Nikolaus',
        fr: 'Saint-Nicolas',
        hu: 'Mikulás',
        nl: 'Sinterklaas',
        vi: 'Thánh Saint Nicholas'
      }
    },
    '12-08': {
      name: {
        en: 'Immaculate Conception',
        de: 'Mariä Empfängnis',
        es: 'La inmaculada concepción',
        fr: 'Immaculée Conception',
        it: 'Immacolata Concezione',
        mt: 'Il-Kunċizzjoni',
        nl: 'Onbevlekte Ontvangenis van Maria',
        pt: 'Imaculada Conceição'
      }
    },
    '12-24': {
      name: {
        en: 'Christmas Eve',
        bg: 'Бъдни вечер',
        bs: 'Badnji dan',
        cz: 'Štědrý den',
        da: 'Juleaften',
        de: 'Heiliger Abend',
        es: 'Nochebuena',
        et: 'jõululaupäev',
        fo: 'Jólaaftan',
        fi: 'Jouluaatto',
        fil: 'Bisperas ng Pasko',
        fr: 'Veille de Noël',
        hr: 'Badnji dan',
        hu: 'Szenteste',
        is: 'Aðfangadagur',
        kl: 'juulliaraq',
        lt: 'Šv. Kūčios',
        lv: 'Ziemassvētku vakars',
        ms: 'Hari Sebelum Krismas',
        nl: 'Kerstavond',
        no: 'Julaften',
        pt: 'Noite de Natal',
        sk: 'Štedrý deň',
        sq: 'Nata e Krishtlindjes',
        sr: 'Бадњи дан',
        sv: 'Julafton',
        vi: 'Đêm Giáng Sinh'
      }
    },
    '12-25': {
      name: {
        en: 'Christmas Day',
        am: 'ልደተ-ለእግዚእነ/ ገና',
        ar: 'عيد الميلاد المجيد',
        bg: 'Коледа',
        bn: 'বড়দিন',
        bs: 'Božić',
        'de-at': 'Christtag',
        ca: 'Nadal',
        cz: '1. svátek vánoční',
        da: 'Juledag',
        de: 'Weihnachten',
        'de-ch': 'Weihnachtstag',
        el: 'Χριστούγεννα',
        es: 'Navidad',
        et: 'esimene jõulupüha',
        fi: 'Joulupäivä',
        fil: 'Araw ng Pasko',
        fo: 'Fyrsti jóladagur',
        fr: 'Noël',
        hr: 'Božić',
        hu: 'Karácsony',
        hy: 'Սուրբ Ծնունդ',
        id: 'Hari Raya Natal',
        it: 'Natale',
        is: 'Jóladagur',
        jp: 'ノエル',
        kl: 'juullerujussuaq',
        ko: '기독탄신일',
        lt: 'Šv. Kalėdos',
        lv: 'Ziemassvētki',
        mg: 'Krismasy',
        mk: 'Католички Божиќ',
        ms: 'Hari Krismas',
        mt: 'Il-Milied',
        nl: 'Kerstmis',
        no: 'Første Juledag',
        pap: 'Dia Pasco di Nascimento',
        pl: 'Pierwszy dzień Bożego Narodzenia',
        pt: 'Natal',
        ro: 'Crăciunul',
        ru: 'Рождество Христово',
        sk: 'Prvý sviatok vianočný',
        sl: 'Božič',
        sq: 'Krishtlindja',
        sr: 'Католички Божић',
        sv: 'Juldagen',
        sw: 'Krismasi',
        vi: 'Lễ Giáng Sinh',
        ti: 'ልደት',
        zh: '聖誕節'
      }
    },
    '12-26': {
      name: {
        en: 'Boxing Day',
        bg: '2-ри ден на Коледа',
        cz: '2. svátek vánoční',
        da: 'Anden Juledag',
        de: '2. Weihnachtstag',
        'de-at': 'Stefanitag',
        'de-ch': 'Stephanstag',
        el: 'Δεύτερη μέρα των Χριστουγέννων',
        es: 'San Esteban',
        et: 'teine jõulupüha',
        fi: '2. joulupäivä',
        fo: 'Fyrsti gerandisdagur eftir jóladag',
        fr: 'Lendemain de Noël',
        hr: 'Svetog Stjepana',
        hu: 'Karácsony másnapja',
        it: 'Santo Stefano',
        is: 'Annar í jólum',
        kl: 'juullip aappaa',
        lt: '2. Kalėdų diena',
        lv: 'Otrie Ziemassvētki',
        nl: 'Tweede kerstdag',
        no: 'Andre juledag',
        pap: 'Di dos Dia Pasco di Nascimento',
        pl: 'Drugi dzień Bożego Narodzenia',
        ro: 'Două zi de Crăciun',
        sk: 'Druhý sviatok vianočný',
        sv: 'Annandag jul',
        vi: 'Ngày tặng quà'
      }
    },
    '12-31': {
      name: {
        en: "New Year's Eve",
        da: 'Nytårsaften',
        de: 'Silvester',
        es: 'Fin del Año',
        fi: 'Uudenvuodenaatto',
        fil: 'Bisperas ng Bagong Taon',
        fo: 'Nýggjársaftan',
        fr: 'Saint-Sylvestre',
        hu: 'Szilveszter',
        hy: 'Նոր տարվա գիշեր',
        is: 'Gamlársdagur',
        it: 'Ultimo dell’anno',
        jp: '大晦日',
        lv: 'Vecgada vakars',
        nl: 'Oudejaarsavond',
        no: 'Nyttårsaften',
        pt: 'Véspera de Ano Novo',
        sv: 'Nyårsafton',
        vi: 'Đêm giao thừa'
      }
    },
    'easter -48': {
      name: {
        en: 'Shrove Monday',
        de: 'Rosenmontag',
        es: 'Carnaval',
        fr: 'Lundi de Carnaval',
        nl: 'Carnavalmaandag',
        pap: 'Dialuna di Carnaval',
        vi: 'Ngày thứ hai hoa hồng'
      }
    },
    'easter -47': {
      name: {
        en: 'Shrove Tuesday',
        es: 'Carnaval',
        de: 'Faschingsdienstag',
        hr: 'Pokladni utorak',
        hu: 'Húshagyó kedd',
        nl: 'Vastenavond',
        pt: 'Carnaval',
        vi: 'Thứ ba mập béo'
      }
    },
    'easter -46': {
      name: {
        en: 'Ash Wednesday',
        de: 'Aschermittwoch',
        es: 'Miercoles de Ceniza',
        fr: 'Mercredi des Cendres',
        hu: 'Hamvazószerda',
        it: 'Ceneri',
        is: 'Öskudagur',
        nl: 'Aswoensdag',
        pt: 'Quarta-feira de Cinzas',
        sw: 'Jumatano ya Majivu',
        vi: 'Thứ tư Lễ Tro'
      }
    },
    'easter -7': {
      name: {
        en: 'Palm Sunday',
        de: 'Palmsonntag',
        es: 'Domingo de Ramos',
        hu: 'Virágvasárnap',
        it: 'Domenica delle Palme',
        is: 'Pálmasunnudagur',
        nl: 'Palmzondag',
        no: 'Palmesøndag',
        vi: 'Chúa nhật Lễ Lá'
      }
    },
    'easter -3': {
      name: {
        en: 'Maundy Thursday',
        cz: 'Zelený čtvrtek',
        da: 'Skærtorsdag',
        de: 'Gründonnerstag',
        es: 'Jueves Santo',
        fil: 'Huwebes Santo',
        fo: 'Skírhósdagur',
        fr: 'Jeudi saint',
        is: 'Skírdagur',
        it: 'Giovedì santo',
        kl: 'sisamanngortoq illernartoq',
        nl: 'Witte donderdag',
        no: 'Skjærtorsdag',
        sv: 'Skärtorsdagen',
        vi: 'Thứ năm Tuần Thánh'
      }
    },
    'easter -2': {
      name: {
        en: 'Good Friday',
        am: 'ስቅለት',
        bg: 'Разпети петък',
        bs: 'Dobar petak',
        cz: 'Velký pátek',
        da: 'Langfredag',
        de: 'Karfreitag',
        es: 'Viernes Santo',
        fi: 'Pitkäperjantai',
        fil: 'Biyernes Santo',
        fo: 'Langafríggjadagur',
        fr: 'Vendredi saint',
        el: 'Μεγάλη Παρασκευή',
        et: 'suur reede',
        ge: 'წითელი პარასკევი',
        hr: 'Veliki petak',
        hu: 'Nagypéntek',
        id: 'Wafat Yesus Kristus',
        it: 'Venerdì santo',
        is: 'Föstudagurinn langi',
        kl: 'tallimanngornersuaq',
        lv: 'Lielā Piektdiena',
        ms: 'Jumat Agung',
        mt: 'Il-Ġimgħa l-Kbira',
        nl: 'Goede Vrijdag',
        no: 'Langfredag',
        pap: 'Diabierna Santo',
        pt: 'Sexta-Feira Santa',
        ro: 'Vinerea Mare',
        sk: 'Veľkonočný piatok',
        sq: 'E Premtja e Madhe',
        sr: 'Католички Велики петак',
        sv: 'Långfredagen',
        sw: 'Ijumaa Kuu',
        vi: 'Thứ sáu Tuần Thánh',
        zh: '耶穌受難節'
      }
    },
    'easter -1': {
      name: {
        en: 'Easter Saturday',
        cz: 'Bílá sobota',
        de: 'Karsamstag',
        es: 'Sabado Santo',
        fil: 'Sabado de Gloria',
        fr: 'Samedi saint',
        ge: 'დიდი შაბათი',
        hu: 'Nagyszombat',
        it: 'Sabado santo',
        nl: 'Dag voor Pasen',
        no: 'Påskeaften',
        sv: 'Påskafton',
        vi: 'Thứ bảy Tuần Thánh',
        zh: '耶穌受難節翌日'
      }
    },
    easter: {
      name: {
        en: 'Easter Sunday',
        am: 'ፋሲካ',
        bg: 'Великден',
        bs: 'Vaskrs',
        cz: 'Velikonoční neděle',
        da: 'Påskesøndag',
        de: 'Ostersonntag',
        el: 'Πάσχα',
        es: 'Pascua',
        et: 'lihavõtted',
        fi: 'Pääsiäispäivä',
        fil: 'Pasko ng Pagkabuhay',
        fo: 'Páskadagur',
        fr: 'Pâques',
        ge: 'აღდგომა',
        hr: 'Uskrs',
        hu: 'Húsvétvasárnap',
        it: 'Domenica di Pasqua',
        is: 'Páskadagur',
        kl: 'poorskip-ullua',
        lt: 'Velykos',
        lv: 'Lieldienas',
        nl: 'Pasen',
        no: 'Første påskedag',
        pap: 'Dia Pasco di Resureccion',
        pl: 'Niedziela Wielkanocna',
        pt: 'Páscoa',
        ro: 'Paștele',
        sk: 'Veľká noc',
        sl: 'Velika noč',
        sq: 'Pashkët Katolike',
        sr: 'Католички Васкрс',
        sv: 'Påskdagen',
        sw: 'Pasaka',
        vi: 'Lễ Phục Sinh',
        zh: '复活节'
      }
    },
    'easter 1': {
      name: {
        en: 'Easter Monday',
        bg: 'Велики понеделник',
        bs: 'Uskrsni ponedjeljak',
        cz: 'Velikonoční pondělí',
        da: 'Anden påskedag',
        de: 'Ostermontag',
        el: 'Δευτέρα του Πάσχα',
        es: 'Lunes de Pascua',
        fi: '2. pääsiäispäivä',
        fo: 'Annar páskadagur',
        fr: 'Lundi de Pâques',
        ge: 'აღდგომის ორშაბათი',
        hr: 'Uskršnji ponedjeljak',
        hu: 'Húsvéthétfő',
        it: 'Lunedì dell’Angelo',
        is: 'Annar í páskum',
        kl: 'poorskip-aappaa',
        lv: 'Otrās Lieldienas',
        mg: "Alatsinain'ny Paska",
        mk: 'вториот ден на Велигден',
        nl: 'Tweede paasdag',
        no: 'Andre påskedag',
        pap: 'Di dos Dia Pasco di Resureccion',
        pl: 'Drugi dzień Wielkanocy',
        ro: 'Două zi de Pasti',
        sk: 'Veľkonočný pondelok',
        sl: 'Velikonočni ponedeljek',
        sr: 'Католички Васкрсни понедељак',
        sv: 'Annandag påsk',
        sw: 'Jumatatu ya Pasaka',
        vi: 'Thứ hai phục sinh',
        zh: '復活節星期一'
      }
    },
    'easter 39': {
      name: {
        en: 'Ascension Day',
        da: 'Kristi Himmelfartsdag',
        de: 'Christi Himmelfahrt',
        es: 'La Asunción',
        fi: 'Helatorstai',
        fo: 'Kristi Himmalsferðardagur',
        fr: 'Ascension',
        id: 'Kenaikan Yesus Kristus',
        it: 'Ascensione',
        is: 'Uppstigningardagur',
        kl: 'qilaliarfik',
        mg: 'Andro niakarana',
        nl: 'O.L.H. Hemelvaart',
        no: 'Kristi himmelfartsdag',
        pap: 'Dia di Asuncion',
        ro: 'Ziua Eroilor',
        sv: 'Kristi himmelfärds dag',
        vi: 'Lễ Thăng Thiên'
      }
    },
    'easter 49': {
      name: {
        en: 'Pentecost',
        da: 'Pinsedag',
        de: 'Pfingstsonntag',
        el: 'Πεντηκοστή',
        es: 'Pentecostés',
        et: 'nelipühade 1. püha',
        fi: 'Helluntaipäivä',
        fo: 'Hvítusunnudagur',
        fr: 'Pentecôte',
        hu: 'Pünkösdvasárnap',
        it: 'Pentecoste',
        is: 'Hvítasunnudagur',
        kl: 'piinsip ullua',
        nl: 'Pinksteren',
        no: 'Første pinsedag',
        mk: 'Духовден',
        pl: 'Zielone Świątki',
        ro: 'Rusaliile',
        sl: 'Binkošti',
        sv: 'Pingstdagen',
        uk: 'Трійця',
        vi: 'Lễ Chúa Thánh Thần Hiện Xuống'
      }
    },
    'easter 50': {
      name: {
        en: 'Whit Monday',
        da: 'Anden Pinsedag',
        de: 'Pfingstmontag',
        el: 'Αγίου Πνεύματος',
        es: 'Lunes de Pentecostés',
        fo: 'Annar hvítusunnudagur',
        fr: 'Lundi de Pentecôte',
        hu: 'Pünkösdhétfő',
        is: 'Annar í hvítasunnu',
        it: 'Lunedì di Pentecoste',
        kl: 'piinsip aappaa',
        mg: "Alatsinain'ny Pentekosta",
        nl: 'Tweede pinksterdag',
        no: 'Andre pinsedag',
        ro: 'Două zi de Rusalii',
        sv: 'Annandag pingst'
      }
    },
    'easter 60': {
      name: {
        en: 'Corpus Christi',
        de: 'Fronleichnam',
        es: 'Corpus Christi',
        fr: 'la Fête-Dieu',
        it: 'Corpus Domini',
        hr: 'Tijelovo',
        nl: 'Sacramentsdag',
        pl: 'Dzień Bożego Ciała',
        pt: 'Corpo de Deus',
        vi: 'Lễ Mình và Máu Thánh Chúa Kitô'
      }
    },
    'julian 01-01': {
      name: {
        en: 'Orthodox New Year',
        bs: 'Pravoslavni novogodišnji dan',
        hr: 'Pravoslavna Nova Godina',
        nl: 'Orthodox Nieuwjaar',
        sq: 'Viti i Ri Ortodoks',
        sr: 'Православна Нова година'
      }
    },
    'julian 12-24': {
      name: {
        en: 'Orthodox Christmas Eve',
        nl: 'Orthodox Kerstavond',
        mk: 'Бадник',
        ti: 'ልደት'
      }
    },
    'julian 12-25': {
      name: {
        en: 'Orthodox Christmas',
        bs: 'Pravoslavni Božić',
        hr: 'Pravoslavni Božić',
        mk: 'Прв ден Божик',
        nl: 'Orthodox Kerstmis',
        ro: 'Craciun pe Rit Vechi',
        sq: 'Krishtlindjet Ortodokse',
        sr: 'Божић',
        uk: 'Різдво'
      }
    },
    'orthodox -2': {
      name: {
        en: 'Orthodox Good Friday',
        mk: 'Велики Петок',
        nl: 'Orthodoxe Goede vrijdag',
        sr: 'Велики петак',
        ti: 'ዓርቢ ስቅለት'
      }
    },
    orthodox: {
      name: {
        en: 'Orthodox Easter',
        bs: 'Pravoslavni Vaskrs',
        hr: 'Pravoslavni Uskrs',
        mk: 'Прв ден Велигден',
        nl: 'Orthodox Pasen',
        sq: 'Pashkët Ortodokse',
        sr: 'Васкрс',
        ti: 'ፋሲካ',
        uk: 'Великдень'
      }
    },
    'orthodox 1': {
      name: {
        en: 'Orthodox Easter Monday',
        mk: 'Втор ден Велигден',
        nl: 'Orthodoxe Tweede Paasdag',
        sr: 'Васкрсни понедељак'
      }
    },
    '1 Muharram': {
      name: {
        en: 'Islamic New Year',
        ar: 'رأس السنة الهجرية',
        bs: 'Nova hidžretska godina',
        fil: 'Unang Araw ng Muharram',
        fr: 'Nouvel an islamique',
        hr: 'Nova hidžretska godina',
        id: 'Tahun Baru Islam',
        ms: 'Awal Muharram',
        nl: 'Islamitisch Nieuwjaar',
        sq: 'Viti i Ri hixhri'
      }
    },
    '10 Muharram': {
      name: {
        en: 'Day of Ashura',
        ar: 'عاشوراء',
        bn: 'আশুরা',
        nl: 'Asjoera'
      }
    },
    '12 Rabi al-awwal': {
      name: {
        en: 'Birthday of Muhammad (Mawlid)',
        am: 'መውሊድ',
        ar: 'المولد النبويّ',
        bn: 'ঈদে মিলাদুন্নবী',
        bs: 'Mevlud',
        fr: 'Mawlid',
        id: 'Maulid Nabi Muhammad',
        ms: 'Hari Keputeraan Nabi Muhammad S.A.W.',
        nl: 'Mawlid an-Nabi',
        sq: 'Mevludi'
      }
    },
    '27 Rajab': {
      name: {
        en: "Laylat al-Mi'raj",
        ar: 'الإسراء والمعراج',
        bs: "Lejletul Mi'radž",
        id: 'Maulid Nabi Muhammad',
        ms: 'Israk dan Mikraj',
        nl: 'Laylat al-Miraadj',
        sq: 'Nata e Miraxhit',
        tr: 'Miraç Gecesi'
      }
    },
    '15 Shaban': {
      name: {
        en: "Laylat al-Bara'at",
        ar: 'ليلة البراءة',
        bs: 'Lejletul berat',
        nl: 'Laylat al-Baraat',
        sq: 'Nata e Beratit'
      }
    },
    '1 Ramadan': {
      name: {
        en: 'First day of Ramadan',
        am: 'ረመዳን',
        ar: 'اليوم الأول من رمضان',
        bs: 'Prvi dan posta',
        ms: 'Awal Ramadan',
        nl: 'Eerste dag van Ramadan',
        sq: 'Dita e parë e agjërimit'
      }
    },
    '17 Ramadan': {
      name: {
        en: 'Day of Nuzul Al-Quran',
        ms: 'Hari Nuzul Al-Quran'
      }
    },
    '23 Ramadan': {
      name: {
        en: 'Lailat al-Qadr'
      }
    },
    '27 Ramadan': {
      name: {
        en: 'Laylat al-Qadr',
        ar: 'لیلة القدر',
        bs: 'Lejletul kadr',
        nl: 'Waardevolle Nacht (Laylat al-Qadr)',
        sq: 'Nata e Kadrit'
      }
    },
    '1 Shawwal': {
      name: {
        en: 'End of Ramadan (Eid al-Fitr)',
        am: 'ዒድ አል ፈጥር',
        ar: 'عيد الفطر',
        az: 'Ramazan Bayramı',
        bn: 'ঈদুল ফিতর',
        bs: 'Ramazanski bajram',
        de: 'Zuckerfest',
        fa: 'ﻋﯿﺪ ﺳﻌﯿﺪ ﻓﻄﺮ',
        fil: 'Pagwawakas ng Ramadan',
        fr: 'Fête de fin du Ramadan',
        hr: 'Ramazanski bajram',
        id: 'Hari Raya Idul Fitri',
        nl: 'Suikerfeest (Eid al-Fitr)',
        mk: 'Рамазан Бајрам',
        ms: 'Hari Raya Aidil Fitri',
        sq: 'Fitër Bajrami',
        tr: 'Ramazan Bayramı',
        sr: 'Рамазански Бајрам',
        sw: 'Idd-ul-Fitr'
      }
    },
    '9 Dhu al-Hijjah': {
      name: {
        en: 'Arafat Day',
        ar: 'يوم عرفة',
        ms: 'Hari Arafah'
      }
    },
    '10 Dhu al-Hijjah': {
      name: {
        en: 'Feast of the Sacrifice (Eid al-Adha)',
        am: 'ዒድ አል አድሐ',
        ar: 'عيد الأضحى',
        az: 'Qurban Bayramı',
        bn: 'ঈদুল আযহা',
        bs: 'Kurbanski bajram',
        de: 'Opferfest',
        fa: 'ﻋﯿﺪ ﺳﻌﯿﺪ ﻗﺮﺑﺎن',
        fil: 'Eidul Adha',
        fr: 'Fête du mouton',
        hr: 'Kurban-bajram',
        id: 'Hari Raya Idul Adha',
        nl: 'Offerfeest (Eid Al-Adha)',
        mk: 'Курбан Бајрам',
        ms: 'Hari Raya Haji',
        sq: 'Kurban Bajrami',
        tr: 'Kurban Bayramı',
        sr: 'Курбански Бајрам',
        sw: 'Idd-ul-Azha'
      }
    },
    '15 Nisan': {
      name: {
        en: 'Pesach',
        bs: 'Pesah',
        de: 'Pessach',
        hr: 'Pesač',
        nl: 'Pesach',
        sq: 'Pesach',
        sr: 'Песах'
      }
    },
    '1 Tishrei': {
      name: {
        en: 'Rosh Hashanah',
        bs: 'Roš Hašana',
        de: 'Rosch Haschana',
        hr: 'Roš Hašane',
        nl: 'Rosj Hasjana',
        sq: 'Rosh Hashanah',
        sr: 'Рош Хашана'
      }
    },
    '10 Tishrei': {
      name: {
        en: 'Yom Kippur',
        bs: 'Jom Kipur',
        de: 'Jom Kippur',
        hr: 'Jom Kipur',
        mk: 'Јом Кипур',
        nl: 'Jom Kipoer',
        sq: 'Yom Kippur',
        sr: 'Јом Кипур'
      }
    },
    Deepavali: {
      name: {
        en: 'Deepavali',
        nl: 'Divali'
      }
    },
    Vesak: {
      name: {
        en: 'Vesak Day',
        id: 'Hari Raya Waisak'
      }
    },
    Holi: {
      name: {
        en: 'Holi Phagwa',
        nl: 'Holi-Phagwa'
      }
    },
    Thaipusam: {
      name: {
        en: 'Thaipusam',
        ms: 'Hari Thaipusam'
      }
    },
    'Abolition of Slavery': {
      name: {
        en: 'Abolition of Slavery',
        fr: 'Abolition de l’esclavage',
        nl: 'Afschaffing van de slavernij',
        vi: 'Bãi bỏ chế độ Nô lệ'
      }
    },
    'Buß- und Bettag': {
      name: {
        de: 'Buß- und Bettag',
        en: 'Day of Prayer and Repentance'
      }
    },
    'Constitution Day': {
      name: {
        en: 'Constitution Day',
        da: 'Grundlovsdag',
        de: 'Tag der Verfassung',
        ca: 'Dia de la Constitució',
        es: 'Día de la Constitución',
        fil: 'Araw ng Saligang Batas',
        fo: 'Grundlógardagur',
        hy: 'Սահմանադրության օր',
        jp: '憲法記念日',
        ko: '제헌절',
        nl: 'Dag van de Grondwet',
        no: 'Grunnlovsdagen',
        pt: 'Dia da Constituição',
        ro: 'Ziua Constituției',
        sk: 'Deň Ústavy',
        sq: 'Dita e Kushtetutës',
        uk: 'День Конституції',
        vi: 'Ngày pháp luật'
      }
    },
    'Fathers Day': {
      name: {
        en: "Father's Day",
        et: 'isadepäev',
        fi: 'Isänpäivä',
        fr: 'Fête des Pères',
        lt: 'Tėvo diena',
        nl: 'Vaderdag',
        pt: 'Dia dos Pais',
        no: 'Farsdag',
        vi: 'Ngày của cha'
      }
    },
    'Independence Day': {
      name: {
        en: 'Independence Day',
        ar: 'عيد الاستقلال',
        be: 'Дзень Незалежнасцi',
        bg: 'Ден на независимостта',
        bs: 'Dan nezavisnosti',
        de: 'Unabhängigkeitstag',
        es: 'Día de la Independencia',
        et: 'iseseisvuspäev',
        fi: 'Itsenäisyyspäivä',
        fil: 'Araw ng Kalayaan',
        fr: "Jour de l'Indépendance",
        hr: 'Dan neovisnosti',
        hy: 'Անկախության օր',
        id: 'Hari Ulang Tahun Kemerdekaan Republik Indonesia',
        mk: 'Ден на независноста',
        ms: 'Hari Kebangsaan',
        mt: 'Jum l-Indipendenza',
        nl: 'Onafhankelijkheidsdag',
        pl: 'Narodowe Święto Niepodległości',
        pt: 'Dia da Independência',
        ro: 'Ziua Independentei',
        sq: 'Dita e Pavarësisë',
        sr: 'Дан независности',
        sv: 'Självständighetsdagen',
        sw: 'Siku ya uhuru',
        ti: 'መዓልቲ ናጽነት',
        uk: 'День Незалежності',
        vi: 'Ngày Độc lập'
      }
    },
    'Liberation Day': {
      name: {
        en: 'Liberation Day',
        ar: 'يوم التحرير',
        nl: 'Bevrijdingsdag',
        no: 'Frigjøringsdagen',
        sq: 'Dita e Çlirimit',
        vi: 'Ngày Thống nhất'
      }
    },
    'Mothers Day': {
      name: {
        en: "Mother's Day",
        cz: 'Den matek',
        da: 'Mors Dag',
        de: 'Muttertag',
        el: 'Γιορτή της μητέρας',
        es: 'Día de la Madre',
        et: 'emadepäev',
        fi: 'Äitienpäivä',
        fr: 'Fête des Mères',
        hr: 'Majčin dan',
        hu: 'Anyák napja',
        hy: 'Ցեղասպանության զոհերի հիշատակի օր',
        is: 'Mæðradagurinn',
        it: 'Festa della mamma',
        lt: 'Motinos diena',
        lv: 'Mātes diena',
        nl: 'Moederdag',
        no: 'Morsdag',
        pt: 'Dia das Mães',
        pl: 'Dzień Matki',
        ro: 'Ziua Mamei',
        sq: 'Dita e Nënës',
        sv: 'Mors dag',
        vi: 'Ngày của mẹ'
      }
    },
    'National Holiday': {
      name: {
        en: 'National Holiday',
        de: 'Nationalfeiertag',
        es: 'Fiesta Nacional',
        fr: 'Fête nationale',
        hu: 'Nemzeti ünnep',
        el: 'εθνική επέτειος',
        nl: 'Nationale feestdag',
        vi: 'Quốc Lễ'
      }
    },
    'Public Holiday': {
      name: {
        en: 'Public Holiday',
        fr: 'Jour férié légaux',
        nl: 'Wettelijke feestdag',
        pt: 'Feriado Obrigatório',
        vi: 'Nghỉ lễ Toàn Quốc'
      }
    },
    'Reformation Day': {
      name: {
        en: 'Reformation Day',
        de: 'Reformationstag',
        es: 'Día Nacional de las Iglesias Evangélicas y Protestantes',
        nl: 'Hervormingsdag',
        vi: 'Kháng Cách'
      }
    },
    'Revolution Day': {
      name: {
        en: 'Revolution Day',
        ar: 'يوم الثورة',
        es: 'Día de la Revolución',
        nl: 'Dag van de revolutie',
        ti: 'ባሕቲ መስከረም',
        vi: 'Tổng khởi nghĩa'
      }
    },
    'Bridge Day': {
      name: {
        en: 'Bridge Day',
        es: 'Feriado Puente Turístico'
      }
    },
    substitutes: {
      name: {
        en: 'substitute day',
        az: 'əvəz gün',
        bs: 'zamjena dan',
        de: 'Ersatztag',
        es: 'día sustituto',
        fr: 'jour substitut',
        hr: 'zamjena dan',
        jp: '振替休日',
        lv: 'aizstājējs diena',
        mk: 'заменет ден',
        nl: 'substituut',
        sq: 'ditë zëvendësuese',
        sr: 'замена дан',
        uk: 'замінити день',
        vi: 'ngày thay thế',
        zh: '更换日'
      }
    }
  }
}
